const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    name: String,
    classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'classSchema' }],
  },
  {
    timestamps: true,
  }
);

const Grade = mongoose.model('gradeSchema', gradeSchema);
module.exports = Grade;
