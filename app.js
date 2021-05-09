const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('express-async-errors');
const app = express();

const config = require('./utils/config');
const logger = require('./utils/logger');
const middleware = require('./utils/middleware');
const notesRouter = require('./controllers/note');
const usersRouter = require('./controllers/user');
const loginRouter = require('./controllers/login');

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
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
