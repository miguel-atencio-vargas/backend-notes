'use strict';
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method);
  logger.info('Path:  ', req.path);
  logger.info('Body:  ', req.body);
  logger.info('---');
  next();
};

const errorHandler = (exception, req, res, next) => {
  logger.error(exception);
  let error;
  if(exception.name === 'CastError') error = 'Malformatted ID';
  if(exception.name === 'ValidationError') error = exception.message;
  if(error) return res.status(400).send({ error });
  next(exception);
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'Unknown endpoint' });
};

module.exports = {
  requestLogger, unknownEndpoint, errorHandler
};


