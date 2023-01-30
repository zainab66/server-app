const express = require('express');
const router = express.Router();
const generateToken = require('../utils.js');
const expressAsyncHandler = require('express-async-handler');
const Doctor = require('../models/doctorModel.js');
const bcrypt = require('bcrypt');
const Assistant = require('../models/assistantModel.js');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body.name;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please add all fields');
    }

    // Check if doctor exists
    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      res.status(400);
      throw new Error('Doctor already exists');
    }
    const doctor = new Doctor({
      name: req.body.name.name,
      email: req.body.name.email,
      password: bcrypt.hashSync(req.body.name.password, 8),
      role: req.body.name.role,
    });
    const createdDoctor = await doctor.save();
    res.send({
      _id: createdDoctor._id,
      name: createdDoctor.name,
      email: createdDoctor.email,
      role: createdDoctor.role,
      token: generateToken(createdDoctor),
    });
  })
);

router.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user =
      (await Doctor.findOne({ email: req.body.email.email })) ||
      (await Assistant.findOne({ email: req.body.email.email }));
    // const validPassword = await bcrypt.compare(
    //   req.body.email.password,
    //   customer.password
    // );
    // if (!validPassword) {
    //   return res.status(401).send('Invalid Password');
    // }
    console.log('user', user);
    // const assistant = await Assistant.findOne({ email: req.body.email.email });
    if (user.role === 'Assistant') {
      user.password = req.body.email.password;
      const updatedAssistant = await user.save();
      res.send({
        _id: updatedAssistant._id,
        name: updatedAssistant.name,
        email: updatedAssistant.email,
        role: updatedAssistant.role,
        token: generateToken(updatedAssistant),
      });
      //  res.send({ message: 'Assistant Updated', assistant: updatedAssistant });
    }
    // else {
    //   res.status(404).send({ message: 'assistant Not Found' });
    // }
    else if (user.role === 'admin') {
      // if (validPassword) {
      res.send({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user),
      });
      return;
    }
    // }
    // res.status(401).send({ message: 'Invalid email ' });
  })
);

module.exports = router;
