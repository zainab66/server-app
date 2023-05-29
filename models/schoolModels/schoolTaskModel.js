const mongoose = require('mongoose');

const schoolTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please write a title for your task'],
  },
  createdBy: { type: String, required: true },

  description: { type: String },
  listId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SchoolList',
    required: true,
  },
});

const SchoolTask = mongoose.model('SchoolTask', schoolTaskSchema);
module.exports = SchoolTask;
