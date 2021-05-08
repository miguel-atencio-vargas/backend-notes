const mongoose = require('mongoose');
const supertest = require('supertest');
const bcrypt = require('bcrypt');

const Note = require('../models/note');
const User = require('../models/user');
const app = require('../app');

const api = supertest(app);


const helper = require('./test_helper');

beforeEach(async () => {
  await Note.deleteMany({});
  const noteObjects = helper.initialNotes.map(note => new Note(note));
  const promiseArray = noteObjects.map(note => note.save());
  await Promise.all(promiseArray);
});

describe('when there is initially some notes saved', () => {
  test('notes are returned as json', async () => {
    await api.get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all notes are returned', async () => {
    const reponse = await api.get('/api/notes');
    expect(reponse.body).toHaveLength(helper.initialNotes.length);
  });

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');
    const contents = response.body.map(r => r.content);
    expect(contents).toContain(
      'Browser can execute only Javascript'
    );
  });
});

describe('viewing a specific note', () => {
  test('succeds with a valid id', async () => {
    const notesAtStart = await helper.notesInDB();
    const noteToView = notesAtStart[0];
    const resultNote = await api
      .get(`/api/notes/${noteToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/);
    // Este procesamiento convertirá cualquier objeto dentro del objeto en un string
    const processedNoteToView = JSON.parse(JSON.stringify(noteToView));
    expect(resultNote.body).toEqual(processedNoteToView);
  });

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonExistingID = await helper.nonExistingID();
    await api.get(`/api/notes/${validNonExistingID}`).expect(404);
  });

  test('fails with statuscode 400 id is invalid', async() => {
    const invalidID = 'aaabbbccc';
    await api.get(`/api/notes/${invalidID}`).expect(400);
  });
});

describe('addition of a new note', () => {
  test('succeeds with valid data', async () => {
    const newNote = {
      content: 'async/await simplify making async calls',
      important: true
    };
    await api.post('/api/notes')
      .send(newNote)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1);

    const content = notesAtEnd.map(n => n.content);
    expect(content).toContain('async/await simplify making async calls');
  });

  test('fails with status 400 if data invalid', async () => {
    const newNote = { important: false };
    await api.post('/api/notes')
      .send(newNote)
      .expect(400);
    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length);
  });
});

describe('deletion of a note', () => {
  test('succeed with status 204 if id is valid', async () => {
    const notesAtStart = await helper.notesInDB();
    const noteToDelete = notesAtStart[0];
    await api
      .delete(`/api/notes/${noteToDelete.id}`)
      .expect(204);
    const notesAtEnd = await helper.notesInDB();
    expect(notesAtEnd).toHaveLength(
      helper.initialNotes.length - 1
    );
    const contents = notesAtEnd.map(r => r.content);
    expect(contents).not.toContain(noteToDelete.content);
  });
});

describe('when there is initially one user in DB', () => {
  beforeEach(async() => {
    await User.deleteMany({});
    const passwordHash =  await bcrypt.hash('zekret', 10);
    const user = new User({ username: 'root', passwordHash });
    await user.save();
  });

  test('creation succeeds with fresh username', async() => {
    const usersAtStart = await helper.usersInDB();
    const newUser = {
      username: 'luka',
      name: 'Luka Ferreira',
      password: 'saleinen'
    };
    await api.post('/api/users').send(newUser)
      .expect(200).expect('Content-Type', /application\/json/);
    const usersAtEnd = await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map(user => user.username);
    expect(usernames).toContain(newUser.username);
  });

  test('creation fails with proper statuscode and message if username already taken', async() => {
    const usersAtStart =  await helper.usersInDB();
    const newUser = {
      username: 'root',
      name: 'Super User',
      password: 'pass'
    };
    const result = await api.post('/api/users').send(newUser)
      .expect(400).expect('Content-Type', /application\/json/);

    expect(result.body.error).toContain('`username` to be unique');
    const usersAtEnd =  await helper.usersInDB();
    expect(usersAtEnd).toHaveLength(usersAtStart.length);
  });
});

afterAll(() => { mongoose.connection.close(); });

