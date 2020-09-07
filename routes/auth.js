const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User } = require('../models/user');
const { Social } = require('../models/social');
const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password.');

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) return res.status(400).send('Invalid email or password');

  const token = user.generateAuthToken();
  res.header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'lastName', 'email', 'role', 'isActive', 'picture']));
});

router.post('/facebook', async (req, res) => {
  const { error } = validateFacebook(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const fbAccessToken = req.headers['x-access-token'];

  const isValidoFB = await validateFBToken(fbAccessToken);

  if (!isValidoFB)
    return res.status(500).send("Facebook Error");
  else {
    let user = await User.findOne({ email: req.body.email });

    if (!user) {
      newUserObject = {
        name: req.body.first_name,
        lastName: req.body.last_name,
        email: req.body.email,
        password: Date.now() + '@facebook@' + req.body.email,
        picture: ""
      }
      user = new User(newUserObject);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);

      try {
        await user.save();
      } catch (ex) {
        for (field in ex.errors)
          console.log(ex.errors[field].message);
      }
    }

    let social = await Social.findOne({ platform: 'facebook', email: req.body.email, userId: user._id });

    const socialObject = {
      platformId: req.body.id,
      platform: 'facebook',
      name: req.body.first_name,
      lastName: req.body.last_name,
      email: req.body.email,
      picture: req.body.picture.data.url,
      userId: user._id
    }

    if (!social) {
      console.log("social does not exist");
      console.log("creating a social for the current user...");
      socialAux = new Social(socialObject);
      try {
        await socialAux.save();
      } catch (ex) {
        for (field in ex.errors)
          console.log(ex.errors[field].message);
      }

      try {
        const userUpdate = await User.findByIdAndUpdate(socialAux.userId, { picture: req.body.picture.data.url }, { new: true, runValidators: true });

        if (!userUpdate) return res.status(404).send('The user with the given id does not exist');

      } catch (e) {
        res.status(400).send(e);
      }
    }

    const token = user.generateAuthToken();
    let returnObject = {
      user: _.pick(user, ['_id', 'name', 'lastName', 'email', 'role', 'isActive', 'picture']),
      social: socialObject
    };
    res.header('x-auth-token', token).send(returnObject);
  }
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(4).max(255).required().email(),
    password: Joi.string().min(5).max(255).required()
  });

  return schema.validate(req);
}

function validateFacebook(req) {
  const schema = Joi.object({
    id: Joi.string(),
    first_name: Joi.string(),
    last_name: Joi.string(),
    email: Joi.string().required().email(),
    picture: Joi.object({
      data: Joi.object({
        height: Joi.number(),
        'is_silhouette': Joi.bool(),
        url: Joi.string(),
        width: Joi.number()
      })
    })
  });

  return schema.validate(req);
}

async function validateFBToken(fbAccessToken) {
  let isFBTokenValid = false;
  try {
    const res = await axios.get('https://graph.facebook.com/v8.0/me', {
      params: {
        access_token: fbAccessToken,
        fields: 'id,first_name,last_name,email'
      }
    });
    return (res.status === 200);
  } catch (e) {
    console.error(e.response.statusText);
    return isFBTokenValid;
  }
}

module.exports = router;