const express = require('express');
const morgan = require('morgan');
const cors = require('cors');


const app = express();
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :body`));
morgan.token('body', req => JSON.stringify(req.body))

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    date: "2019-05-30T17:30:31.098Z",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only Javascript",
    date: "2019-05-30T18:39:34.091Z",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    date: "2019-05-30T19:20:14.298Z",
    important: true
  }];

const generateId = () => {
  return (notes.length > 0 ? Math.max(...notes.map(e => e.id)) : 0)+1;
}

app.get('/api/info', (req, res) => {
  const HTMLdata = `
    <p>Bloc of notes have ${notes.length} notes.</p>
    <p>${new Date()}</p>`;
  res.send(HTMLdata)
});

app.get('/api/notes', (req, res) => {
  res.json(notes)
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

