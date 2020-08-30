const config = require('config');
const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//Routes
const users = require('./routes/users');
const auth = require('./routes/auth');

const app = express();
app.use(express.json());

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERRROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

//Connect to mongodb
mongoose.connect('mongodb://localhost/api-app', {
  useNewUrlParser: true, useUnifiedTopology: true
}, (err) => {
  if (err) throw err;
  console.log("Connected to MongoDB...");
});

app.use(cors({
  origin: [
    "http://localhost", "http://localhost:3001", "http://localhost:3000",
    "*"
  ],
  credentials: true,
  exposedHeaders: ['Access-Control-Allow-Origin', 'Vary', 'Content-Length', 'x-auth-token']
}));

app.use('/api/users', users);
app.use('/api/auth', auth);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));