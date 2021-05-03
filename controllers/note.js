'use strict';
const notesRouter = require('express').Router();
const Note = require('../models/note');
//const logger = require('../utils/logger');

notesRouter.get('/info', (req, res, next) => {
  Note.countDocuments({})
    .then(totalNotes => res.send({ 'Quantity in notes': totalNotes }))
    .catch(err => next(err));
});

notesRouter.get('/', (req, res, next) => {
  Note.find({})
    .then(notes => res.json(notes))
    .catch(err => next(err));
});

notesRouter.get('/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if(!note) return res.status(404).end();
      res.json(note);
    })
    .catch(err => next(err));
});

notesRouter.delete('/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      if(!result) return res.status(404).send({
        message: 'ID not found'
      });
      res.status(204).end();
    })
    .catch(err => next(err));
});

notesRouter.post('/', (req, res, next) => {
  const body = req.body;
  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date()
  });
  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(savedAndFormattedNote => res.json(savedAndFormattedNote))
    .catch(err => next(err));
});

notesRouter.put('/:id', (req, res, next) => {
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important
  };
  const options = { new: true };
  Note.findByIdAndUpdate(req.params.id, note, options)
    .then(updatedNote => updatedNote.toJSON())
    .then(updatedAndFormattedNote => res.json(updatedAndFormattedNote))
    .catch(err => next(err));
});

module.exports = notesRouter;
