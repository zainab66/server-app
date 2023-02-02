const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const Assistant = require('../models/assistantModel.js');
const authorize = require('../middleware/authorize');
const isDoctor = require('../middleware/doctorAuthorize');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

router.post(
  '/addUser',
  authorize,
  isDoctor,
  expressAsyncHandler(async (req, res) => {
    const { fullName, email, role, createdBy } = req.body;
    console.log(req.body);
    try {
      const oldUser =
        (await Assistant.findOne({ email })) ||
        (await Assistant.findOne({ fullName }));
      if (oldUser) {
        return res.status(200).json({ message: 'User already exists' });
      } else {
        // const user = new Assistant({
        //   fullName: req.body.fullName,
        //   email: req.body.email,
        //   role: req.body.role,
        //   createdBy: req.body.createdBy,
        // });
        // const createdUser = await user.save();

        res.status(200).json({ message: 'Invitation send successfully' });

        const token = jwt.sign(
          { fullName, email, role, createdBy },
          process.env.JWT_ACC_ACTIVATE,
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
          subject: ' Account Activation Link',
          html: `<h2>Hello ${fullName}</h2>
        
    <h2>Please click on given link to activate you account</h2>
    <p>${process.env.CLIENT_URL}/activate/${token}</p>`,
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

// router.post(
//   '/signin',
//   expressAsyncHandler(async (req, res) => {
//     const customer = await Assistant.findOne({ email: req.body.email.email });
//     // const validPassword = await bcrypt.compare(
//     //   req.body.email.password,
//     //   customer.password
//     // );
//     // if (!validPassword) {
//     //   return res.status(401).send('Invalid Password');
//     // }
//     if (customer) {
//       // if (validPassword) {
//       res.send({
//         _id: customer._id,
//         name: customer.name,
//         email: customer.email,
//         isCustomer: customer.isCustomer,
//         token: generateToken(customer),
//       });
//       console.log('l', customer.isCustomer);
//       return;
//       // }
//     }
//     res.status(401).send({ message: 'Invalid email ' });
//   })
// );

router.post(
  '/email-activate',
  expressAsyncHandler(async (req, res) => {
    const token = req.body.token;
    if (token) {
      jwt.verify(
        token,
        process.env.JWT_ACC_ACTIVATE,
        function (err, decodedToken) {
          if (err) {
            return res
              .status(400)
              .json({ message: 'Incorrect or Expired link' });
          }
          const { fullName, email, role, createdBy } = decodedToken;

          Assistant.findOne({ email }).exec((err, user) => {
            if (user) {
              return res
                .status(401)
                .json({ message: 'Assistant already exists' });
            }

            const assistant = new Assistant({
              fullName,
              email,
              role,
              createdBy,
            });

            assistant.save((err, success) => {
              if (err) {
                return res.status(400).json({ error: err });
              }
              res.json({ message: 'Activated success', success });
            });
          });
        }
      );
    } else {
      return res.json({ message: 'Incorrect ' });
    }
  })
);

module.exports = router;
