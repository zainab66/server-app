const mongoose = require('mongoose');

const principleSchema = new mongoose.Schema(
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
    token: { type: String, default: '' },
    image: { type: String, default: '' },
    school: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
      },
    ],
  },
  {
    timestamps: true,
  }
);
const Principle = mongoose.model('Principle', principleSchema);
module.exports = Principle;
