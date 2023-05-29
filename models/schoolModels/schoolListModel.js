const mongoose = require('mongoose');

const schoolListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  createdBy: { type: String, required: true },

  cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SchoolTask' }],
});

const SchoolList = mongoose.model('SchoolList', schoolListSchema);

module.exports = SchoolList;
