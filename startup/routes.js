const express = require('express');
const helmet = require('helmet');
const users = require('../routes/users');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const cors = require('cors');

module.exports = function (app) {
  //TODO: origin based in config
  app.use(helmet());
  app.use(cors({
    origin: [
      "http://localhost", "http://localhost:3001", "http://localhost:3000", "https://localhost:3001", "http://192.168.0.3", "https://192.168.0.3", "http://localhost:5000", "*"
    ],
    credentials: true,
    exposedHeaders: ['Access-Control-Allow-Origin', 'Vary', 'Content-Length', 'x-auth-token']
  }));
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/auth', auth);
  app.use(error);
}