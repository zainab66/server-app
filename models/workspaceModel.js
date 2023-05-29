const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
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
      // required: true,
    },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);
const Workspace = mongoose.model(' Workspace', workspaceSchema);
module.exports = Workspace;
