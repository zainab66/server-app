const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: { type: String, required: true },
    role: { type: String, required: true },
    profilePicture: { type: String },
    resetLink: { String, default: '' },
  },
  {
    timestamps: true,
  }
);
const Doctor = mongoose.model('Doctor', doctorSchema);
module.exports = Doctor;
