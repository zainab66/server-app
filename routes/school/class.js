const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../../middleware/authorize');
const isPrinciple = require('../../middleware/principleAuthorize');
const Teacher = require('../../models/schoolModels/teacherModel');
const Student = require('../../models/schoolModels/studentModel');
const Class = require('../../models/schoolModels/classSchemaModel');
const isTeacher = require('../../middleware/teacherAuthorize');
const Grade = require('../../models/schoolModels/gradeSchemaModel');

router.post(
  '/addClass',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    try {
      const { name, teacherName, gradeId } = req.body.name;
      console.log(name, teacherName, gradeId);
      const grade = await Grade.findById(gradeId);
      if (!grade) {
        return res.status(404).json({ error: 'Grade not found' });
      }

      const newClass = new Class({ name, teacherName });
      await newClass.save();

      grade.classes.push(newClass);
      await grade.save();

      res.status(200).json({
        newClass,
        message: 'Class create successfully',
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  })
);

// router.post(
//   '/addClass',
//   authorize,
//   isPrinciple,
//   expressAsyncHandler(async (req, res) => {
//     const { name } = req.body;
//     const Class = await Class.findOne({ name: name });
//     console.log(Class);
//     if (Class) {
//       res.status(400).json({ message: 'Class already exists' });
//     }
//     const classesName = new Class({ name });
//     await classesName.save();
//     // res.json(list);

//     res.status(200).json({
//       classesName,
//       message: 'Class create successfully',
//     });
//   })
// );

router.get(
  '/getClasses',
  authorize,
  //   isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const classes = await Class.find({});
    res.send({ classes });
  })
);

router.delete(
  '/delete/:classId',
  authorize,
  isPrinciple,
  expressAsyncHandler(async (req, res) => {
    //const { todoId } = req.params
    const classToDelete = await Class.findOne({ _id: req.params.classId });
    if (classToDelete) {
      const deleteClass = await classToDelete.remove();
      res.status(200).json({ message: 'Class Deleted', class: deleteClass });
    } else {
      res.status(404).json({ message: 'Class Not Found' });
    }
  })
);

module.exports = router;
