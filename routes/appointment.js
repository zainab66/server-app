const express = require('express');
const router = express.Router();
const Patient = require('../models/patientModel.js');
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../middleware/authorize');
const Appointment = require('../models/appointmentModel');

router.get(
  '/',
  //   authorize,
  expressAsyncHandler(async (req, res) => {
    // const patients = await Patient.find({ createdBy: req.user._id });
    // const patients = await Patient.findOne({
    //   firstName: req.params.patientName,
    // });
    const { search } = req.query;
    console.log(search);
    const patients = await Patient.find({
      firstName: search,
    });
    res.status(200).json({ patients });
    //console.log(patients, patients[0]._id);
  })
);

router.post(
  '/addAppointment',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      age,
      gender,
      city,
      postalCode,
      region,
      isPatient,
      patientCreatedBy,
      patientId,
      createdBy,
      appointmentStatus,
      visitDate,
      visitTime,
    } = req.body;
    console.log(
      email,
      firstName,
      lastName,
      phoneNumber,
      age,
      gender,
      city,
      postalCode,
      region,
      isPatient,
      patientCreatedBy,
      patientId,
      createdBy,
      appointmentStatus,
      visitDate,
      visitTime
    );

    // Check if user exists
    const userExists = await Appointment.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'Appointment already exists' });
    }

    // const updateAppointment = await Appointment.findOne({ patientId });
    // if (updateAppointment) {
    //   updateAppointment.visitDate =
    //     req.body.visitDate || updateAppointment.visitDate;
    //   updateAppointment.visitTime =
    //     req.body.visitTime || updateAppointment.visitTime;

    //   const updateAppointmentForPatient = await updateAppointment.save();

    //   res.status(200).json({
    //     updateAppointmentForPatient,
    //     message: 'Appointment create successfully',
    //   });
    // }

    const appointment = new Appointment({
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
      patientCreatedBy: req.body.patientCreatedBy,
      patientId: req.body.patientId,
      appointmentStatus: req.body.appointmentStatus,
      visitDate: req.body.visitDate,
      visitTime: req.body.visitTime,
    });
    const createdAppointment = await appointment.save();
    res.status(200).json({
      createdAppointment,
      message: 'Appointment create successfully',
    });
  })
);

router.get(
  '/getAppointments',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const appointments = await Appointment.find({});
    res.status(200).json({ appointments });
  })
);

router.delete(
  '/:patientId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const appointment = await Appointment.findOne({
      patientId: req.params.patientId,
    });
    if (appointment) {
      const deleteAppointment = await appointment.remove();
      res.send({ message: 'Appointment Deleted', deleteAppointment });
    } else {
      res.status(404).send({ message: 'Appointment Not Found' });
    }
  })
);

router.put(
  '/:patientId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    // console.log(req.params.patientId);

    const appointment = await Appointment.findOne({
      patientId: req.params.patientId,
    });
    if (appointment) {
      appointment.visitTime = req.body.visitTime || appointment.visitTime;
      appointment.visitDate = req.body.visitDate || appointment.visitDate;
      appointment.appointmentStatus =
        req.body.appointmentStatus || appointment.appointmentStatus;
      appointment.createdBy = req.body.createdBy || appointment.createdBy;

      const updatedAppointment = await appointment.save();
      res
        .status(200)
        .json({ updatedAppointment, message: 'updatedAppointment Updated' });
      // res.send({ message: 'Patient Updated',updatedpatient });
      // console.log('p', updatedpatient);
    } else {
      res.status(404).json({ message: 'updatedAppointment Not Found' });
    }
  })
);

module.exports = router;
