'use strict';
const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
//const logger = require('../utils/logger');


notesRouter.get('/info', async(req, res) => {
  const totalNotes = await Note.countDocuments({});
  res.send({ 'Total notes': totalNotes });
});

notesRouter.get('/', async(req, res) => {
  const notes = await Note.find({}).populate('user', {
    username: 1,
    name: 1
  });
  res.json(notes);
});

notesRouter.get('/:id', async(req, res) => {
  const note = await Note.findById(req.params.id);
  if(!note) return res.status(404).end();
  res.json(note);
});

notesRouter.delete('/:id', async(req, res) => {
  await Note.findByIdAndRemove(req.params.id);
  res.status(204).end();
});

notesRouter.post('/', async(req, res) => {
  const body = req.body;
  const user = await User.findById(body.userID);
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
    user: user._id
  });
  const savedNote = await note.save();
  user.notes = user.notes.concat(savedNote._id);
  await user.save();
  res.json(savedNote);
});

notesRouter.put('/:id', async(req, res) => {
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important
  };
  const options = { new: true };
  const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, options);
  const updatedAndFormattedNote = await updatedNote.toJSON();
  res.json(updatedAndFormattedNote);
});

module.exports = notesRouter;
