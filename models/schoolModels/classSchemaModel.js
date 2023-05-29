const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    teacherName: String,
  },
  {
    timestamps: true,
  }
);
const Class = mongoose.model('classSchema', classSchema);
module.exports = Class;
