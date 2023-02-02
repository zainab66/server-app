const express = require('express');
const router = express.Router();
const generateToken = require('../utils.js');
const expressAsyncHandler = require('express-async-handler');
const Doctor = require('../models/doctorModel.js');
const bcrypt = require('bcrypt');
const Assistant = require('../models/assistantModel.js');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const _ = require('lodash');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post(
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body.name;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please add all fields' });
    }
    // Check if doctor exists
    const doctorExists = await Doctor.findOne({ email });

    if (doctorExists) {
      res.status(400).json({ message: 'User already exists' });
    }
    const doctor = new Doctor({
      name: req.body.name.name,
      email: req.body.name.email,
      password: bcrypt.hashSync(req.body.name.password, 8),
      role: req.body.name.role,
    });
    const createdDoctor = await doctor.save();
    const user = {
      _id: createdDoctor._id,
      name: createdDoctor.name,
      email: createdDoctor.email,
      role: createdDoctor.role,
      token: generateToken(createdDoctor),
    };

    res.status(200).json({ message: 'User registered successfully', user });
  })
);

router.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const userLogin =
      (await Doctor.findOne({ email: req.body.email })) ||
      (await Assistant.findOne({ email: req.body.email }));

    if (userLogin) {
      if (userLogin.role === 'Assistant') {
        if (userLogin.password) {
          const validPassword = await bcrypt.compare(
            req.body.password,
            userLogin.password
          );
          if (!validPassword) {
            res.status(401).json({ message: 'Invalid Password' });
          }

          if (validPassword) {
            const updatedAssistant = await userLogin.save();
            const user = {
              _id: updatedAssistant._id,
              name: updatedAssistant.name,
              email: updatedAssistant.email,
              role: updatedAssistant.role,
              token: generateToken(updatedAssistant),
            };
            res.send({ message: 'Login successfully', user });
          }
        } else {
          userLogin.password = bcrypt.hashSync(req.body.password, 8);

          const updatedAssistant = await userLogin.save();
          const user = {
            _id: updatedAssistant._id,
            name: updatedAssistant.name,
            email: updatedAssistant.email,
            role: updatedAssistant.role,
            token: generateToken(updatedAssistant),
          };
          res.send({ message: 'Login successfully', user });
        }
      } else if (userLogin.role === 'admin') {
        const validPassword = await bcrypt.compare(
          req.body.password,
          userLogin.password
        );
        if (!validPassword) {
          res.status(401).json({ message: 'Invalid Password' });
        }

        if (validPassword) {
          const user = {
            _id: userLogin._id,
            name: userLogin.name,
            email: userLogin.email,
            role: userLogin.role,
            token: generateToken(userLogin),
          };
          res.json({ message: 'Login successfully', user });
        }
      }
    } else {
      res.status(401).json({ message: 'Invalid email ' });
    }
  })
);

router.put(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    const user =
      (await Doctor.findOne({ email })) || (await Assistant.findOne({ email }));

    if (!user) {
      res.status(400).json({ message: 'User does not exists' });
    }
    if (user) {
      const token = jwt.sign(
        { _id: user._id },
        process.env.RESET_PASSWORD_KEY,
        {
          expiresIn: '20m',
        }
      );

      let smtpTransport = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        auth: {
          user: 'zainabdeveloper123@gmail.com',
          pass: 'wklvipkbxbzdogtf',
        },
      });

      let mailOptions = {
        from: 'no-reply',
        to: email,
        subject: 'Reset Your Password',
        html: `
             <h2>Please click on given link to reset your password</h2>
             <p>${process.env.CLIENT_URL}/resetpassword/${token}</p>`,
      };
      user.token = token;

      const updatedAssistant = await user.save();
      if (!updatedAssistant) {
        return res.status(400).json({ message: 'Reset password link error' });
      } else {
        smtpTransport.sendMail(mailOptions, (error, response) => {
          if (error) {
            res.send(error);
          } else {
            res.json({ message: 'Please check your email' });
          }
        });
        smtpTransport.close();
      }
    }
  })
);

router.put(
  '/reset-password',
  expressAsyncHandler(async (req, res) => {
    const { token, password } = req.body;
    console.log(token);
    const user =
      (await Doctor.findOne({ token })) || (await Assistant.findOne({ token }));
    if (token) {
      jwt.verify(
        token,
        process.env.RESET_PASSWORD_KEY,
        function (error, decodedData) {
          if (error) {
            return res
              .status(401)
              .json({ message: 'Incorrect or Expired link' });
          }

          if (!user) {
            return res
              .status(400)
              .send({ message: 'User with this token does not exists' });
          }
          const obj = {
            password: bcrypt.hashSync(password, 8),
            token: '',
          };

          user.password = bcrypt.hashSync(password, 8);
          user.token = '';
          user.save((err, result) => {
            if (err) {
              return res.status(400).json({ message: 'reset password  error' });
            } else {
              return res.status(200).json({
                message: 'Your password has been changed successfully',
              });
            }
          });
        }
      );
    } else {
      return res.status(401).json({ message: 'Authentication error' });
    }
  })
);

module.exports = router;
