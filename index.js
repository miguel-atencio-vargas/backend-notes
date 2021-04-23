const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();
const password = process.env.MONGO_PASS;

const url = `mongodb+srv://fullstack_user:${password}@cluster0.2w4jk.mongodb.net/note-app?retryWrites=true`;
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true });

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
});
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    console.log(returnedObject.id)
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});
const Note = mongoose.model('Note', noteSchema);


const app = express();
app.use(express.json());
app.use(express.static('build'))
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`));
morgan.token('body', req => JSON.stringify(req.body))


const generateId = () => {
  return (notes.length > 0 ? Math.max(...notes.map(e => e.id)) : 0)+1;
}

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
  const id = +req.params.id;
  const note = notes.find(item => item.id === id);
  if(!note) res.status(404).end();
  res.json(note);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = +req.params.id;
  notes = notes.filter(item => item.id !== id);
  res.status(204).end();
});

app.post('/api/notes', (req, res) => {
  const body = req.body;
  if(!body.content) {
    return res.status(400).json({
      error: 'content missing'
    })
  }

  const note = {
    content: body.content,
    important: body.important || false,
    date: new Date(),
    id: generateId()
  }
    notes = notes.concat(note);

  res.json(note);
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknow endpoint' })
}
app.use(unknownEndpoint)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('Server listen on:', PORT);
});

