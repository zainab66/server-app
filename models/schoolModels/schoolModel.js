const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      default: 'school',
    },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);
const Schools = mongoose.model(' School', schoolSchema);
module.exports = Schools;
