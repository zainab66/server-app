const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
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
    address: { type: String, required: true },
    description: { type: String, required: true },
    occupation: { type: String, required: true },
    firstVisit: { type: String },
    recurringvisit: { type: String },
    isPatient: { type: Boolean, default: true, required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
