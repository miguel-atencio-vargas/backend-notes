const usersRouter = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/user');

usersRouter.get('/', async(req, res) => {
  const users = await User.find({});
  res.json(users);
});

usersRouter.post('/', async(req, res) => {
  const body = req.body;
  const regExp = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm;
  if(!regExp.test(body.password)) return res.status(400).json({
    error: 'Password is not secure'
  });
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(body.password, saltRounds);
  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  });
  const savedUser = await user.save();
  res.json(savedUser);
});

module.exports = usersRouter;
