'use strict';
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const express = require('express');
const cors = require('cors');

const Note = require('./models/note');


const app = express();
app.use(express.static('build'))
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());


const requestLogger = (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Path:  ', req.path);
  console.log('Body:  ', req.body);
  console.log('---')
  next();
}
app.use(requestLogger);


app.get('/api/notes', (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes);
  });
});

app.get('/api/notes/:id', (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if(!note) return res.status(404).end();
      res.json(note);
    })
    .catch(err => next(err));
});

app.delete('/api/notes/:id', (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(result => {
      if(!result) return res.status(404).send({message: 'ID not found'});
      res.status(204).end();
    })
    .catch(err => next(err))
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
  note.save().then(savedNote => res.json(savedNote));
});

app.put('/api/notes/:id', (req, res, next) => {
  const body = req.body;
  const note = {
    content: body.content,
    important: body.important
  }
  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then( updatedNote => {
      res.json(updatedNote)
    })
    .catch(err => next(err));
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
}
app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.log(error);
  if(error.name === 'CastError') return res.status(400).send({ 
    message: 'Malformatted ID'
  });
  next(error);
}
app.use(errorHandler);


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log('Server listen on:', PORT));

