const Joi = require('joi');
const express = require('express');
const mongoose = require('mongoose');

//Routes
const users = require('./routes/users');

const app = express();

//Connect to mongodb
mongoose.connect('mongodb://localhost/api-app')
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());
app.use('/api/users', users);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`))

//Create the actual item
async function createUser() {
  const user = new User({
    name: 'Juana',
    lastName: 'de Arco',
    email: 'juana@gmail.com',
    password: '12345678',
    role: 'admin',
    isActive: true
  });

  try {
    const result = await user.save();
    console.log(result);
  } catch (ex) {
    for (field in ex.errors)
      console.log(ex.errors[field].message);
  }
}

//createUser();

async function getUsers() {
  const users = await User
    .find({ name: 'Enrique', isActive: true })
    .limit(10)
    .sort({ name: 1 })
    .select({ email: 1 });
  console.log(users);
}

//getUsers();