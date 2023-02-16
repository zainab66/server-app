const mongoose = require('mongoose');

const assistantSchema = new mongoose.Schema(
  {
    fullName: {
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
    image: { type: String },

    // phoneNumber: { type: String, required: true },
    // country: { type: String, required: true },
    // state: { type: String, required: true },
    // city: { type: String, required: true },
    // address: { type: String, required: true },
    // zipCode: { type: String, required: true },
    // company: { type: String, required: true },
    // role: { type: String, required: true },
    role: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
const Assistant = mongoose.model('Assistant', assistantSchema);
module.exports = Assistant;
