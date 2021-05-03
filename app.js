const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/note');


const MONGODB_URI = config.MONGODB_URI;
logger.info('connecting to', MONGODB_URI.substr(0, 28));

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then(() => logger.info('Connected to MongoDB'))
  .catch((error) => logger.info('Error connecting to MongoDB:', error.message));


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/notes', notesRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
