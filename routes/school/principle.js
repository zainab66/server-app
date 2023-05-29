const express = require('express');
const router = express.Router();
const expressAsyncHandler = require('express-async-handler');
const authorize = require('../../middleware/authorize');
const isPrinciple = require('../../middleware/principleAuthorize');
const Teacher = require('../../models/schoolModels/teacherModel');
const Student = require('../../models/schoolModels/studentModel');
const Class = require('../../models/schoolModels/classSchemaModel');

const env = require('dotenv');
env.config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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

module.exports = router;
