const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const roles = ['admin', 'editor', 'client', 'provider'];

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    lowercase: true
  },
  lastName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 255,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 255,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1024
  },
  role: {
    type: String,
    enum: roles,
    default: 'client'
  },
  createdAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: false }
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const User = mongoose.model('User', userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(2).max(255).required(),
    lastName: Joi.string().min(2).max(255).required(),
    email: Joi.string().min(4).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;