const mongoose = require('mongoose');
const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');

const socialSchema = new mongoose.Schema({
  platformId: {
    type: String,
  },
  platform: {
    type: String,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    lowercase: true
  },
  lastName: {
    type: String,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  },
  picture: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

socialSchema.methods.generateAuthToken = function () {
  const token = jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
  return token;
}

const Social = mongoose.model('Social', socialSchema);

function validateSocial(social) {
  const schema = Joi.object({
    name: Joi.string(),
    lastName: Joi.string(),
    email: Joi.string().min(4).max(255).required().email(),
    picture: Joi.string()
  });

  return schema.validate(social);
}

exports.Social = Social;
exports.validate = validateSocial;