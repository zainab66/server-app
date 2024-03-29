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
    bill: { type: Number, required: true },
    phoneNumber: { type: Number, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    city: { type: String, required: true },
    region: { type: String, required: true },
    postalCode: { type: String, required: true },
    isPatient: { type: String, default: true, required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;
