const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const Student = require('../../models/schoolModels/studentModel');
const authorize = require('../../middleware/authorize');
const isPrinciple = require('../../middleware/principleAuthorize');
const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const generateToken = require('../../utils.js');

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const _ = require('lodash');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.AWS_REGION,
});

router.post(
  '/addStudent',
  authorize,
  //   isPrinciple,
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const {
      email,
      firstName,
      lastName,
      gender,
      birthDate,
      grade,
      classType,
      fatherName,
      phoneNumber,
      address,
      createdBy,
      joiningDate,
      image,
      age,
    } = req.body;

    //   if (!name || !email || !password) {
    //     res.status(400);
    //     throw new Error('Please add all fields');
    //   }
    if (req.file) {
      // Check if user exists
      const studentExists = await Student.findOne({ email });

      if (studentExists) {
        res.status(400).json({ message: 'Student already exists' });
      }
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);
      const student = new Student({
        email,
        firstName,
        lastName,
        gender,
        birthDate,
        grade,
        classType,
        fatherName,
        phoneNumber,
        address,
        createdBy,
        joiningDate,
        image: req.file.originalname,
        age,
      });
      const createdStudent = await student.save();
      res
        .status(200)
        .json({ createdStudent, message: 'Student create successfully' });
    } else {
      // Check if user exists
      const studentExists = await Student.findOne({ email });

      if (studentExists) {
        res.status(400).json({ message: 'Student already exists' });
      }

      const student = new Student({
        email,
        firstName,
        lastName,
        gender,
        birthDate,
        grade,
        classType,
        fatherName,
        phoneNumber,
        address,
        createdBy,
        joiningDate,
        image,
        age,
      });
      const createdStudent = await student.save();
      res
        .status(200)
        .json({ createdStudent, message: 'Student create successfully' });
    }
  })
);

router.get(
  '/getStudents',
  authorize,
  //   isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const students = await Student.find({ createdBy: req.user._id });
    res.send({ students });
  })
);

router.delete(
  '/delete/:studentId',
  authorize,
  //   isPrinciple,
  expressAsyncHandler(async (req, res) => {
    //const { todoId } = req.params
    const student = await Student.findOne({ _id: req.params.studentId });
    // console.log(todoId)
    if (student) {
      const deleteStudent = await student.remove();
      res
        .status(200)
        .json({ message: 'Student Deleted', student: deleteStudent });
    } else {
      res.status(404).json({ message: 'Student Not Found' });
    }
  })
);

router.put(
  '/edit',
  authorize,
  //   isPrinciple,
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const { email, name, about, image, studentId, keyImageToDelete } = req.body;
    console.log(keyImageToDelete, image, req.file);
    if (keyImageToDelete) {
      // Remove the image from the S3 bucket
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: keyImageToDelete,
        // Body: req.file.buffer,
        // ContentType: req.file.mimetype,
      };
      s3.send(new DeleteObjectCommand(params))
        .then((data) => {
          console.log('Image removed successfully'); // Handle success appropriately
        })
        .catch((err) => {
          console.log(err); // Handle error appropriately
        });

      const student = await Student.findById({ _id: req.body.studentId });
      if (student) {
        student.firstName = req.body.firstName || student.firstName;
        student.lastName = req.body.lastName || student.lastName;
        student.email = req.body.email || student.email;
        student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
        student.age = req.body.age || student.age;
        student.gender = req.body.gender || student.gender;
        student.salary = req.body.salary || student.salary;
        student.address = req.body.address || student.address;
        student.birthDate = req.body.birthDate || student.birthDate;
        student.grade = req.body.grade || student.grade;
        student.joiningDate = req.body.joiningDate || student.joiningDate;
        student.classType = req.body.classType || student.classType;
        student.fatherName = req.body.fatherName || student.fatherName;
        student.image = '';
        const updatedStudent = await student.save();
        res.send({ message: 'Student Updated', student: updatedStudent });
      }
    }
    if (req.file) {
      const student = await Student.findById({ _id: req.body.studentId });

      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);
      if (student) {
        student.firstName = req.body.firstName || student.firstName;
        student.lastName = req.body.lastName || student.lastName;
        student.email = req.body.email || student.email;
        student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
        student.age = req.body.age || student.age;
        student.gender = req.body.gender || student.gender;
        student.salary = req.body.salary || student.salary;
        student.address = req.body.address || student.address;
        student.birthDate = req.body.birthDate || student.birthDate;
        student.grade = req.body.grade || student.grade;
        student.joiningDate = req.body.joiningDate || student.joiningDate;
        student.classType = req.body.classType || student.classType;
        student.fatherName = req.body.fatherName || student.fatherName;
        student.image = req.file.originalname || student.image;

        const updatedStudent = await student.save();
        res.send({ message: 'Student Updated', student: updatedStudent });
      } else {
        res.status(404).send({ message: 'Student Not Found' });
      }
    } else {
      const student = await Student.findById({ _id: req.body.studentId });
      if (student) {
        student.firstName = req.body.firstName || student.firstName;
        student.lastName = req.body.lastName || student.lastName;
        student.email = req.body.email || student.email;
        student.phoneNumber = req.body.phoneNumber || student.phoneNumber;
        student.age = req.body.age || student.age;
        student.gender = req.body.gender || student.gender;
        student.salary = req.body.salary || student.salary;
        student.address = req.body.address || student.address;
        student.birthDate = req.body.birthDate || student.birthDate;
        student.grade = req.body.grade || student.grade;
        student.joiningDate = req.body.joiningDate || student.joiningDate;
        student.classType = req.body.classType || student.classType;
        student.fatherName = req.body.fatherName || student.fatherName;
        student.image = student.image;
        const updatedStudent = await student.save();
        res.send({ message: 'Student Updated', student: updatedStudent });
      } else {
        res.status(404).send({ message: 'Student Not Found' });
      }
    }
  })
);
module.exports = router;
