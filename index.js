const express = require('express');
const mongoose = require('mongoose');

//Connect to mongodb
mongoose.connect('mongodb://localhost/api-app')
  .then(() => console.log("Connected to MongoDB..."))
  .catch(err => console.error('Could not connect to MongoDB...', err));

//Create Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  date: { type: Date, default: Date.now },
  isActive: Boolean
});
//Create model
const User = mongoose.model('User', userSchema);
//Create the actual item
async function createUser() {
  const user = new User({
    name: 'Diana',
    email: 'diana@gmail.com',
    password: '12345678',
    isActive: true
  });

  const result = await user.save();

  console.log(result);
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

getUsers();