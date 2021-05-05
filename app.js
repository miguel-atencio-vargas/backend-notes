const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/note');


logger.info('connecting to', config.MONGODB_URI);

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
})
  .then((_) => {
    const uri = _.connections[0]._connectionString;
    logger.info('Connected to:', uri);
  })
  .catch((error) => logger.info('Error connecting to MongoDB:', error.message));


app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.static('build'));
app.use(express.json());
app.use(middleware.requestLogger);

app.use('/api/notes', notesRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
