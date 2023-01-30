const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel.js');
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../middleware/authorize');
const isDoctor = require('../middleware/doctorAuthorize');
const isAssistance = require('../middleware/assistantAuthorize');

router.post(
  '/addPatient',
  expressAsyncHandler(async (req, res) => {
    const {
      email,
      firstName,
      phoneNumber,
      lastName,
      age,
      gender,
      isPatient,
      createdBy,
    } = req.body;
    console.log(
      email,
      firstName,
      phoneNumber,
      lastName,
      age,
      gender,
      isPatient,
      createdBy
    );
    //   if (!name || !email || !password) {
    //     res.status(400);
    //     throw new Error('Please add all fields');
    //   }

    // Check if user exists
    const userExists = await Patient.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'Patient already exists' });
    }

    const patient = new Patient({
      firstName: req.body.firstName,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      lastName: req.body.lastName,
      age: req.body.age,
      gender: req.body.gender,
      region: req.body.region,
      city: req.body.city,
      postalCode: req.body.postalCode,
      isPatient: req.body.isPatient,
      createdBy: req.body.createdBy,
    });
    const createdPatient = await patient.save();
    res
      .status(200)
      .json({ createdPatient, message: 'Patient create successfully' });
    // res.send({
    //   _id: createdUser._id,
    //   firstName: createdUser.firstName,
    //   email: createdUser.email,
    //   phoneNumber: createdUser.phoneNumber,
    //   lastName: createdUser.lastName,
    //   age: createdUser.age,
    //   gender: createdUser.gender,
    //   region: createdUser.region,
    //   city: createdUser.city,
    //   postalCode: createdUser.postalCode,
    //   isPatient: createdUser.isPatient,
    //   createdBy: createdUser.createdBy,
    // });
  })
);

router.get(
  '/getPatient',
  authorize,
  isAssistance,

  expressAsyncHandler(async (req, res) => {
    console.log(req.user._id);
    const patients = await Patient.find({ createdBy: req.user._id });
    res.status(200).json({ patients });
    //console.log(patients, patients[0]._id);
  })
);

router.put(
  '/:patientId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    // console.log(req.params.patientId);

    const patient = await Patient.findOne({ patientId: req.params.patientId });
    if (patient) {
      patient.firstName = req.body.firstName || patient.firstName;
      // profile.email = req.body.email || profile.email;
      // profile.password = req.body.password||  profile.password;

      const updatedpatient = await patient.save();
      res.status(200).json({ updatedpatient, message: 'Patient Updated' });
      // res.send({ message: 'Patient Updated',updatedpatient });
      // console.log('p', updatedpatient);
    } else {
      res.status(404).json({ message: 'Patient Not Found' });
    }
  })
);

router.delete(
  '/:patientId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const { patientId } = req.params;
    const patient = await Patient.findOne({ patientId: req.params.patientId });
    console.log(patientId);
    if (patient) {
      const deletePatient = await patient.remove();
      res.send({ message: 'Patient Deleted', deletePatient });
    } else {
      res.status(404).send({ message: 'Patient Not Found' });
    }
  })
);
module.exports = router;
