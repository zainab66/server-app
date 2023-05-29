const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const Assistant = require('../models/assistantModel.js');
const authorize = require('../middleware/authorize');
const isDoctor = require('../middleware/doctorAuthorize');
const nodemailer = require('nodemailer');
const multer = require('multer');

const jwt = require('jsonwebtoken');
const env = require('dotenv');
env.config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
  '/addUser',
  authorize,
  isDoctor,
  expressAsyncHandler(async (req, res) => {
    const { fullName, email, role, createdBy, type } = req.body;
    console.log(req.body);
    try {
      const oldUser =
        (await Assistant.findOne({ email })) ||
        (await Assistant.findOne({ fullName }));
      if (oldUser) {
        return res.status(200).json({ message: 'User already exists' });
      } else {
        res.status(200).json({ message: 'Invitation send successfully' });

        const token = jwt.sign(
          { fullName, email, role, createdBy },
          process.env.JWT_ACC_ACTIVATE,
          {
            expiresIn: '7d',
          }
        );

        const user = new Assistant({
          fullName: req.body.fullName,
          email: req.body.email,
          role: req.body.role,
          createdBy: req.body.createdBy,
          type: req.body.type,
          token: token,
        });
        const createdUser = await user.save();

        let smtpTransport = nodemailer.createTransport({
          service: 'Gmail',
          port: 465,
          auth: {
            user: 'zainabdeveloper123@gmail.com',
            pass: 'wklvipkbxbzdogtf',
          },
        });
        // Send an email to the user with a link that includes the token
        const url = `${process.env.CLIENT_URL}/activate/${token}`;
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

router.get(
  '/getAssistant/:id',
  expressAsyncHandler(async (req, res) => {
    const assistant = await Assistant.findById({ _id: req.params.id });
    if (assistant) {
      res.json({ profile: assistant, message: 'Success' });
    } else {
      res.status(404).json({ message: 'Assistant Not Found' });
    }
  })
);

router.get(
  '/getUsers',
  authorize,
  isDoctor,

  expressAsyncHandler(async (req, res) => {
    console.log(req.user._id);
    const users = await Assistant.find({ createdBy: req.user._id, token: '' });
    res.send({ users });
  })
);

router.delete(
  '/:userId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const user = await Assistant.findOne({ _id: req.params.userId });
    if (user) {
      const deleteUser = await user.remove();
      res.status(200).json({ message: 'User Deleted', user: deleteUser });
    } else {
      res.status(404).json({ message: 'User Not Found' });
    }
  })
);

router.put(
  '/editAssistant',
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const { email, fullName, about, image, id } = req.body;

    const assistant = await Assistant.findById({ _id: req.body.id });

    const params = {
      Bucket: process.env.S3_BUCKET,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    const command = new PutObjectCommand(params);

    await s3.send(command);
    if (assistant) {
      assistant.fullName = req.body.fullName || assistant.fullName;
      assistant.email = req.body.email || assistant.email;
      assistant.about = req.body.about || assistant.about;
      assistant.image = req.file.originalname || assistant.image;
      const updatedAssistant = await assistant.save();
      res.status(200).json({ updatedAssistant, message: 'Assistant Updated' });
    } else {
      res.status(404).json({ message: 'Assistant, Not Found' });
    }
  })
);

router.post(
  '/email-activate',
  expressAsyncHandler(async (req, res) => {
    const token = req.body.token;

    const decodedToken = jwt.verify(token, process.env.JWT_ACC_ACTIVATE);
    console.log(decodedToken);
    const { fullName, email, role, createdBy } = decodedToken;
    const assistant = await Assistant.findOne({ token });
    if (!assistant) {
      return res.status(400).json({ message: 'Invalid invitation token' });
    }
    assistant.fullName = fullName || assistant.fullName;
    assistant.email = email || assistant.email;
    assistant.role = role || assistant.role;
    assistant.createdBy = createdBy || assistant.createdBy;
    assistant.token = '';
    const updatedAssistant = await assistant.save();
    res.status(200).json({ message: 'Activated success', updatedAssistant });
  })
);

module.exports = router;
