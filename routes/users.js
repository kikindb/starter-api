const auth = require('../middleware/auth');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

//Get current user
router.get('/me', auth, async (req, res) => {
  const me = await User.findById(req.user._id).select(['-password', '-createdAt', '-isActive', '-role']);
  res.send(me);
})
//Get All Users
router.get('/', auth, async (req, res) => {
  const users = await User.find().sort('name');
  res.send(users);
})
//Create a new user
router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['name', 'lastName', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();
  } catch (ex) {
    for (field in ex.errors)
      console.log(ex.errors[field].message);
  }

  const token = user.generateAuthToken();

  res.status(201).header('x-auth-token', token).send(_.pick(user, ['_id', 'name', 'lastName', 'email', 'role', 'isActive']));
});
//Update an user 
router.patch('/:id', auth, async (req, res) => {
  //const { error } = validate(req.body);
  //if (error) return res.status(400).send(error.details[0].message);
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'lastName', 'email', 'isActive'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates' })
  }

  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    if (!user) return res.status(404).send('The user with the given id does not exist');

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});
//Delete a user
router.delete('/:id', [auth], async (req, res) => {
  if (!req.params.id) return res.status(400).send('Id is required.');

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) res.status(404).send('The user does not exist');
    res.status(200).send(user);
  } catch (ex) {
    res.status(400).send();
  }
});

module.exports = router;