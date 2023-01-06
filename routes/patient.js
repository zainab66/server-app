const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel.js');
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../middleware/authorize');
const isDoctor = require('../middleware/doctorAuthorize');
router.post(
  '/addPatient',
  expressAsyncHandler(async (req, res) => {
    // const {
    //   email,
    //   firstName,
    //   phoneNumber,
    //   lastName,
    //   age,
    //   gender,
    //   address,
    //   description,
    //   occupation,
    //   firstVisit,
    //   recurringvisit,
    //   isPatient,
    //   createdBy,
    // } = req.body.email;

    //   if (!name || !email || !password) {
    //     res.status(400);
    //     throw new Error('Please add all fields');
    //   }

    // Check if user exists
    //const userExists = await User.findOne({ email });

    // if (userExists) {
    //   res.status(400);
    //   throw new Error('User already exists');
    // }

    const user = new Patient({
      firstName: req.body.email.firstName,
      email: req.body.email.email,
      phoneNumber: req.body.email.phoneNumber,
      lastName: req.body.email.lastName,
      age: req.body.email.age,
      gender: req.body.email.gender,
      address: req.body.email.address,
      description: req.body.email.description,
      occupation: req.body.email.occupation,
      firstVisit: req.body.email.firstVisit,
      recurringvisit: req.body.email.recurringvisit,
      isPatient: req.body.email.isPatient,
      createdBy: req.body.email.createdBy,
    });
    const createdUser = await user.save();
    res.send({
      _id: createdUser._id,
      firstName: createdUser.firstName,
      email: createdUser.email,
      phoneNumber: createdUser.phoneNumber,
      lastName: createdUser.lastName,
      age: createdUser.age,
      gender: createdUser.gender,
      address: createdUser.address,
      description: createdUser.description,
      occupation: createdUser.occupation,
      firstVisit: createdUser.firstVisit,
      recurringvisit: createdUser.recurringvisit,
      isPatient: createdUser.isPatient,
      createdBy: createdUser.createdBy,
    });
  })
);

router.get(
  '/getPatient',
  authorize,
  isDoctor,

  expressAsyncHandler(async (req, res) => {
    console.log(req.user._id);
    const patients = await Patient.find({ createdBy: req.user._id });
    res.send({ patients });
  })
);

module.exports = router;
