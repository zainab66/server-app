const express = require('express');
const router = express.Router();
const generateToken = require('../utils.js');
const expressAsyncHandler = require('express-async-handler');
const Assistant = require('../models/assistantModel.js');
const bcrypt = require('bcrypt');
const authorize = require('../middleware/authorize');
const isDoctor = require('../middleware/doctorAuthorize');
const nodemailer = require('nodemailer');
router.post(
  '/addUser',
  expressAsyncHandler(async (req, res) => {
    const {
      fullName,
      email,
      phoneNumber,
      country,
      state,
      city,
      address,
      zipCode,
      company,
      role,
      // password,
      createdBy,
    } = req.body.email;
    const password = 123456;
    let smtpTransport = nodemailer.createTransport({
      service: 'Gmail',
      port: 465,
      auth: {
        user: 'zainabdeveloper123@gmail.com',
        pass: 'sccsakkmaxjicent',
      },
    });

    let mailOptions = {
      from: 'no-reply',
      to: email,
      subject: ' Account Activation Link',
      html: `<h2>Hello ${fullName}</h2>
     <h2>Please click on given link to activate you account by using these credentials
Email:${email} 
Password:${password}  </h2>
     <p>http://localhost:3000/login</p>`,
    };

    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        res.send(error);
      } else {
        res.status(200).send({
          message: 'Please make your account :)',
        });
      }
    });
    smtpTransport.close();

    //   if (!name || !email || !password) {
    //     res.status(400);
    //     throw new Error('Please add all fields');
    //   }

    // Check if user exists
    //const userExists = await User.findOne({ email });

    // if (userExists) {
    //   res.status(400);
    //   throw new Error('User already exists');
    // }

    const user = new Assistant({
      fullName: req.body.email.fullName,
      email: req.body.email.email,
      // phoneNumber: req.body.email.phoneNumber,
      // country: req.body.email.country,
      // state: req.body.email.state,
      // city: req.body.email.city,
      // address: req.body.email.address,
      // zipCode: req.body.email.zipCode,
      // company: req.body.email.company,
      // role: req.body.email.role,
      role: req.body.email.role,
      password: password,

      createdBy: req.body.email.createdBy,
    });
    const createdUser = await user.save();
    res.send({
      _id: createdUser._id,
      fullName: createdUser.fullName,
      email: createdUser.email,
      // phoneNumber: createdUser.phoneNumber,
      // country: createdUser.country,
      // state: createdUser.state,
      // city: createdUser.city,
      // address: createdUser.address,
      // zipCode: createdUser.zipCode,
      // company: createdUser.company,
      // role: createdUser.role,
      password: createdUser.password,
      role: createdUser.role,

      createdBy: createdUser.createdBy,
    });
  })
);

router.get(
  '/getUsers',
  authorize,
  isDoctor,

  expressAsyncHandler(async (req, res) => {
    console.log(req.user._id);
    const users = await Assistant.find({ createdBy: req.user._id });
    res.send({ users });
  })
);

router.delete(
  '/:userId',
  authorize,
  expressAsyncHandler(async (req, res) => {
    //const { todoId } = req.params
    const user = await Assistant.findOne({ userId: req.params.userId });
    // console.log(todoId)
    if (user) {
      const deleteUser = await user.remove();
      res.send({ message: 'User Deleted', user: deleteUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);
router.put(
  '/:id',
  authorize,
  isDoctor,
  expressAsyncHandler(async (req, res) => {
    const user = await Assistant.findById(req.params.id);
    console.log('user', req.params.id);
    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

router.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const customer = await Assistant.findOne({ email: req.body.email.email });
    // const validPassword = await bcrypt.compare(
    //   req.body.email.password,
    //   customer.password
    // );
    // if (!validPassword) {
    //   return res.status(401).send('Invalid Password');
    // }
    if (customer) {
      // if (validPassword) {
      res.send({
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        isCustomer: customer.isCustomer,
        token: generateToken(customer),
      });
      console.log('l', customer.isCustomer);
      return;
      // }
    }
    res.status(401).send({ message: 'Invalid email ' });
  })
);

module.exports = router;
