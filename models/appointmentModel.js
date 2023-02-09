const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    phoneNumber: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: String, required: true },
    gender: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
    isPatient: { type: String, default: true, required: true },
    patientCreatedBy: { type: String, required: true },

    createdBy: { type: String, required: true },
    appointmentStatus: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    visitDate: {
      type: Date,
    },
    visitTime: {
      type: String,
    },
    patientId: { type: String, required: true },
    createdBy: { type: String, required: true },
    updatedAt: Date,
  },
  {
    timestamps: true,
  }
);
const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
