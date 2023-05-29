const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    // middleName: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   unique: true,
    //   lowercase: true,
    // },
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
    createdBy: { type: String, required: true },

    image: { type: String },
    phoneNumber: { type: String },
    address: { type: String },
    gender: { type: String },
    joiningDate: { type: Date },
    birthDate: { type: Date },
    age: { type: Number },
    grade: { type: String },
    classType: { type: String },
    fatherName: { type: String },
  },
  {
    timestamps: true,
  }
);
const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
