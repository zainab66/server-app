const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: String, required: true },

  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
});

const List = mongoose.model('List', listSchema);

module.exports = List;
