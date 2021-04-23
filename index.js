'use strict';
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const Note = require('./models/note');


const app = express();
app.use(express.json());
app.use(express.static('build'))
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));
morgan.token('body', req => JSON.stringify(req.body))


app.get('/api/info', (req, res) => {
  const HTMLdata = `
    <p>Notes app have ${notes.length} notes.</p>
    <p>${new Date()}</p>`;
  res.send(HTMLdata)
});

app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  });
});

app.get('/api/notes/:id', (req, res) => {
  Note.findById(req.params.id).then(note => res.json(note));
});

app.delete('/api/notes/:id', (req, res) => {
  const id = +req.params.id;
  notes = notes.filter(item => item.id !== id);
  res.status(204).end();
});

app.post('/api/notes', (req, res) => {
  const body = req.body;
  if (!body.content) return res.status(400).json({
    error: 'content missing'
  });
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  });
  note.save().then(savedNote => {
    res.json(savedNote);
  });
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
}
app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server listen on:', PORT));

