const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    lastName: {
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
    password: { type: String },
    token: { type: String, default: '' },
    role: { type: String },
    createdBy: { type: String, required: true },

    image: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    gender: { type: String },
    salary: { type: String },
    joiningDate: { type: Date },
    age: { type: Number },
  },
  {
    timestamps: true,
  }
);
const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
