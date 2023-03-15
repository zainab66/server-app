const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please write a title for your task'],
  },
  createdBy: { type: String, required: true },

  description: { type: String },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
