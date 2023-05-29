const express = require('express');
const router = express.Router();
const generateToken = require('../../utils.js');
const expressAsyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const Principle = require('../../models/schoolModels/principleModel');
const Schools = require('../../models/schoolModels/schoolModel.js');
const authorize = require('../../middleware/authorize');
const env = require('dotenv');
env.config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const Teacher = require('../../models/schoolModels/teacherModel');

const client = new OAuth2Client(process.env.googleClintId_KEY);
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
  '/register',
  expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Please add all fields' });
    }
    // Check if doctor exists
    const userExists = await Principle.findOne({ email });

    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
    }

    const school = new Schools({
      name: req.body.dashboardName,
      // other fields as needed
    });
    await school.save();

    const newUser = new Principle({
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 8),
      role: req.body.role,
      school: [school._id],
    });
    const createdUser = await newUser.save();
    // console.log(createdDoctor);
    const user = {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      token: generateToken(createdUser),
    };

    res.status(200).json({ message: 'User registered successfully', user });
  })
);
router.post(
  '/login',
  expressAsyncHandler(async (req, res) => {
    const type = req.body.type;

    const userLogin =
      (await Principle.findOne({ email: req.body.email })) ||
      (await Teacher.findOne({ email: req.body.email }));

    if (userLogin) {
      if (userLogin.role === 'teacher') {
        if (userLogin.password) {
          const validPassword = await bcrypt.compare(
            req.body.password,
            userLogin.password
          );
          if (!validPassword) {
            res.status(401).json({ message: 'Invalid Password' });
          }

          if (validPassword) {
            const updatedTeacher = await userLogin.save();
            const user = {
              _id: updatedTeacher._id,
              firstName: updatedTeacher.firstName,
              lastName: updatedTeacher.lastName,

              email: updatedTeacher.email,
              role: updatedTeacher.role,

              token: generateToken(updatedTeacher),
            };
            res.send({ message: 'Login successfully', user });
          }
        } else {
          userLogin.password = bcrypt.hashSync(req.body.password, 8);

          const updatedTeacher = await userLogin.save();
          const user = {
            _id: updatedTeacher._id,
            firstName: updatedTeacher.firstName,
            lastName: updatedTeacher.lastName,

            email: updatedTeacher.email,
            role: updatedTeacher.role,

            token: generateToken(updatedTeacher),
          };
          res.send({ message: 'Login successfully', user });
        }
      } else if (userLogin.role === 'principle') {
        const validPassword = await bcrypt.compare(
          req.body.password,
          userLogin.password
        );
        if (!validPassword) {
          res.status(401).json({ message: 'Invalid Password' });
        }

        if (validPassword) {
          // const user = {
          //   _id: userLogin._id,
          //   name: userLogin.name,
          //   email: userLogin.email,
          //   role: userLogin.role,
          //   token: generateToken(userLogin),
          //   workspaces: userLogin.workspaces,
          // };

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

// router.post(
//   '/login',
//   expressAsyncHandler(async (req, res) => {
//     const userExists = await Principle.findOne({ email: req.body.email });
//     if (userExists) {
//       const school = await Schools.findOne({
//         _id: userExists.school,
//       });
//       if (bcrypt.compareSync(req.body.password, userExists.password)) {
//         const user = {
//           _id: userExists._id,
//           name: userExists.name,
//           email: userExists.email,
//           role: userExists.role,
//           token: generateToken(userExists),
//           school: userExists.school,
//           type: school.type,
//           dashboardName: school.dashboardName,
//         };
//         res.status(200).json({ message: 'User login successfully', user });
//       }
//     }
//     res.status(401).send({ message: 'Invalid email or password' });
//   })
// );

router.get(
  '/getUserProfile/:id',
  authorize,
  expressAsyncHandler(async (req, res) => {
    const user =
      (await Principle.findById(req.params.id)) ||
      (await Teacher.findById(req.params.id));
    if (user) {
      res.json({ profile: user, message: 'Success' });
    } else {
      res.status(404).json({ message: 'User Not Found' });
    }
  })
);

router.put(
  '/editUserProfile',
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const { email, name, about, image, id } = req.body;
    console.log(req.file);
    if (req.file) {
      const user = await Principle.findById({ _id: req.body.id });

      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.about = req.body.about || user.about;
        user.image = req.file.originalname || user.image;
        const updatedUser = await user.save();
        res.status(200).json({ updatedUser, message: 'User Updated' });
      } else {
        res.status(404).json({ message: 'User Not Found' });
      }
    } else {
      const user = await Principle.findById({ _id: req.body.id });
      if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.about = req.body.about || user.about;
        // user.image = req.file.originalname || user.image;
        const updatedUser = await user.save();
        res.status(200).json({ updatedUser, message: 'User Updated' });
      } else {
        res.status(404).json({ message: 'User Not Found' });
      }
    }
  })
);

router.put(
  '/forget-password',
  expressAsyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await Principle.findOne({ email });
    //|| (await Assistant.findOne({ email }));

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
             <p>${process.env.CLIENT_URL_SCHOOL}/resetpassword/${token}</p>`,
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
    const user = await Principle.findOne({ token });
    // || (await Assistant.findOne({ token }));
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

// router.post(
//   '/googlelogin',
//   expressAsyncHandler(async (req, res) => {
//     const { tokenId } = req.body;
//     const verify = await client.verifyIdToken({
//       idToken: tokenId,
//       audience: process.env.googleClintId_KEY,
//     });
//     const { email_verified, name, email } = verify.payload;

//     const password = email + process.env.JWT_SIGNIN_KEY;
//     const passwordHash = await bcrypt.hash(password, 8);

//     if (email_verified) {
//       console.log('ppppp');
//       Principle.findOne({ email }).exec((err, user) => {
//         if (err) {
//           return res.status(400).json({
//             error: 'somthing wrong ...',
//           });
//         } else {
//           if (user) {
//             console.log('user');

//             const token = jwt.sign(
//               { _id: user._id },
//               process.env.JWT_SIGNIN_KEY,
//               {
//                 expiresIn: '20m',
//               }
//             );
//             const { _id, name, email } = user;
//             res.json({
//               token,
//               _id,
//               name,
//               email,
//             });
//           } else {
//             console.log('newUser');

//             //   let newUser = new Principle({
//             //     name,
//             //     email,
//             //     password: passwordHash,
//             //   });
//             // newUser.save((err, data) => {
//             //   if (err) {
//             //     return res.status(400).json({
//             //       error: 'somthing wrong ...',
//             //     });
//             //   }
//             //   const token = jwt.sign(
//             //     { _id: data._id },
//             //     process.env.JWT_SIGNIN_KEY,
//             //     {
//             //       expiresIn: '20m',
//             //     }
//             //   );
//             //   const { _id, name, email } = newUser;
//             //   res.json({
//             //     token,
//             //     _id,
//             //     name,
//             //     email,
//             //   });
//             // });
//           }
//         }
//       });
//     }
//   })
// );

router.put(
  '/teacher/editTeacherProfile',
  upload.single('image'),
  expressAsyncHandler(async (req, res) => {
    const { email, name, about, image, id } = req.body;
    console.log(req.file);
    if (req.file) {
      const user = await Teacher.findById({ _id: req.body.id });
      console.log('tt', req.body.id);
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: req.file.originalname,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);

      await s3.send(command);
      if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.about = req.body.about || user.about;
        user.image = req.file.originalname || user.image;
        const updatedUser = await user.save();
        res.status(200).json({ updatedUser, message: 'User Updated' });
      } else {
        res.status(404).json({ message: 'User Not Found' });
      }
    } else {
      const user = await Teacher.findById({ _id: req.body.id });
      if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.email = req.body.email || user.email;
        user.about = req.body.about || user.about;
        // user.image = req.file.originalname || user.image;
        const updatedUser = await user.save();
        res.status(200).json({ updatedUser, message: 'User Updated' });
      } else {
        res.status(404).json({ message: 'User Not Found' });
      }
    }
  })
);

module.exports = router;
