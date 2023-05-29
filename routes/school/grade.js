const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../../middleware/authorize');
const isPrinciple = require('../../middleware/principleAuthorize');
const Teacher = require('../../models/schoolModels/teacherModel');
const Student = require('../../models/schoolModels/studentModel');
const Grade = require('../../models/schoolModels/gradeSchemaModel');
const isTeacher = require('../../middleware/teacherAuthorize');

router.post(
  '/addGrade',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    try {
      const gradeCheck = await Grade.findOne({ name: req.body.name });

      if (gradeCheck) {
        res.status(400).json({ message: 'Grade already exists' });
      }

      const grade = new Grade({ name: req.body.name });
      await grade.save();
      res.status(200).json({
        grade,
        message: 'Grade create successfully',
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  })
);

router.get(
  '/getGrades',
  authorize,
  //   isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const grades = await Grade.find().populate('classes');
    res.send({ grades });
  })
);

router.delete(
  '/delete/:gradeId',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    //const { todoId } = req.params
    const grade = await Grade.findOne({ _id: req.params.gradeId });
    // console.log(todoId)
    if (grade) {
      const deleteGrade = await grade.remove();
      res.status(200).json({ message: 'Grade Deleted', grade: deleteGrade });
    } else {
      res.status(404).json({ message: 'Grade Not Found' });
    }
  })
);
module.exports = router;
