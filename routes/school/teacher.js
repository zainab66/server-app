const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const Teacher = require('../../models/schoolModels/teacherModel');
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
  '/addTeacher',
  authorize,
  // isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const { firstName, lastName, email, role, createdBy } = req.body;
    try {
      const oldUser = await Teacher.findOne({ email });
      if (oldUser) {
        return res.status(200).json({ message: 'Teacher already exists' });
      } else {
        res.status(200).json({ message: 'Invitation send successfully' });

        const token = jwt.sign(
          { firstName, lastName, email, role, createdBy },
          process.env.JWT_ACC_ACTIVATE,
          {
            expiresIn: '7d',
          }
        );

        const user = new Teacher({
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          role: req.body.role,
          createdBy: req.body.createdBy,
          token: token,
        });
        await user.save();
        console.log(token);
        let smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          port: 465,
          auth: {
            user: 'zainabdeveloper123@gmail.com',
            pass: 'wklvipkbxbzdogtf',
          },
        });
        // Send an email to the user with a link that includes the token
        const url = `${process.env.CLIENT_URL_SCHOOL}/activate/${token}`;
        const html = `Click <a href="${url}">here</a> to register for an account.`;
        let mailOptions = {
          from: 'no-reply',
          to: email,
          subject: 'Invitation to join our application',
          html: html,
        };

        smtpTransport.sendMail(mailOptions, (error, response) => {
          if (error) {
            res.send(error);
          } else {
            res.status(200).json({
              message:
                'Please visit your email address and active your account',
            });
          }
        });
        smtpTransport.close();
      }
    } catch (error) {
      res.status(500).json({ message: 'Something went wrong' });
      console.log(error);
    }
  })
);

router.post(
  '/email-activate',
  expressAsyncHandler(async (req, res) => {
    const token = req.body.token;
    const decodedToken = jwt.verify(token, process.env.JWT_ACC_ACTIVATE);
    const { firstName, lastName, email, role, createdBy } = decodedToken;
    const teacher = await Teacher.findOne({ token });
    if (!teacher) {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }
    teacher.firstName = firstName || teacher.firstName;
    teacher.lastName = lastName || teacher.lastName;

    teacher.email = email || teacher.email;
    teacher.createdBy = createdBy || teacher.createdBy;
    teacher.token = '';
    const updatedTeacher = await teacher.save();
    res.status(200).json({ message: 'Activated success', updatedTeacher });
  })
);

router.get(
  '/getTeachers',
  authorize,
  // isPrinciple,
  expressAsyncHandler(async (req, res) => {
    const teachers = await Teacher.find({});

    // const teachers = await Teacher.find({ createdBy: req.user._id, token: '' });
    res.send({ teachers });
  })
);

router.delete(
  '/delete/:teacherId',
  authorize,
  // isPrinciple,
  expressAsyncHandler(async (req, res) => {
    //const { todoId } = req.params
    const teacher = await Teacher.findOne({ _id: req.params.teacherId });
    // console.log(todoId)
    if (teacher) {
      const deleteTeacher = await teacher.remove();
      res
        .status(200)
        .json({ message: 'Teacher Deleted', teacher: deleteTeacher });
    } else {
      res.status(404).json({ message: 'Teacher Not Found' });
    }
  })
);

router.put(
  '/edit',
  authorize,
  // isPrinciple,
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const { email, name, about, keyImageToDelete, teacherId } = req.body;
    console.log(req.body.teacherId, teacherId);

    if (keyImageToDelete) {
      // Remove the image from the S3 bucket
      const params = {
        Bucket: process.env.S3_BUCKET_TEACHER,
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

      const teacher = await Teacher.findById({ _id: req.body.teacherId });
      if (teacher) {
        teacher.firstName = req.body.firstName || teacher.firstName;
        teacher.lastName = req.body.lastName || teacher.lastName;
        teacher.email = req.body.email || teacher.email;
        teacher.phoneNumber = req.body.phoneNumber || teacher.phoneNumber;
        teacher.age = req.body.age || teacher.age;
        teacher.gender = req.body.gender || teacher.gender;
        teacher.salary = req.body.salary || teacher.salary;
        teacher.address = req.body.address || teacher.address;
        teacher.joiningDate = req.body.joiningDate || teacher.joiningDate;
        teacher.image = '';

        const updatedTeacher = await teacher.save();
        res.send({ message: 'Teacher Updated', teacher: updatedTeacher });
      }
    }

    if (req.file) {
      const teacher = await Teacher.findById({ _id: req.body.teacherId });

      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);
      if (teacher) {
        teacher.firstName = req.body.firstName || teacher.firstName;
        teacher.lastName = req.body.lastName || teacher.lastName;
        teacher.email = req.body.email || teacher.email;
        teacher.phoneNumber = req.body.phoneNumber || teacher.phoneNumber;
        teacher.age = req.body.age || teacher.age;
        teacher.gender = req.body.gender || teacher.gender;
        teacher.salary = req.body.salary || teacher.salary;
        teacher.address = req.body.address || teacher.address;
        teacher.joiningDate = req.body.joiningDate || teacher.joiningDate;
        teacher.image = req.file.originalname || teacher.image;

        const updatedTeacher = await teacher.save();
        res.send({ message: 'Teacher Updated', teacher: updatedTeacher });
      } else {
        res.status(404).send({ message: 'Teacher Not Found' });
      }
    } else {
      const teacher = await Teacher.findById({ _id: req.body.teacherId });
      if (teacher) {
        teacher.firstName = req.body.firstName || teacher.firstName;
        teacher.lastName = req.body.lastName || teacher.lastName;
        teacher.email = req.body.email || teacher.email;
        teacher.phoneNumber = req.body.phoneNumber || teacher.phoneNumber;
        teacher.age = req.body.age || teacher.age;
        teacher.gender = req.body.gender || teacher.gender;
        teacher.salary = req.body.salary || teacher.salary;
        teacher.address = req.body.address || teacher.address;
        teacher.joiningDate = req.body.joiningDate || teacher.joiningDate;
        teacher.image = teacher.image;
        const updatedTeacher = await teacher.save();
        res.send({ message: 'Teacher Updated', teacher: updatedTeacher });
      } else {
        res.status(404).send({ message: 'Teacher Not Found' });
      }
    }
  })
);

module.exports = router;
