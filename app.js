const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const env = require('dotenv');
env.config();

const indexRouter = require('./routes/index');
const doctorRouter = require('./routes/doctor');
const assistantRouter = require('./routes/assistant');
const patientRouter = require('./routes/patient');
const appointmentRouter = require('./routes/appointment');
const eventRouter = require('./routes/event');
const taskRouter = require('./routes/task');

const schoolUserRouter = require('./routes/school/schoolUser');
const teacherRouter = require('./routes/school/teacher');
const principleRouter = require('./routes/school/principle');
const schoolEventRouter = require('./routes/school/schoolEvent');
const schoolTaskRouter = require('./routes/school/schoolTask');
const schoolStudentRouter = require('./routes/school/student');
const schoolClassRouter = require('./routes/school/class');
const schoolGradeRouter = require('./routes/school/grade');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/patient', patientRouter);
app.use('/api/appointment', appointmentRouter);
app.use('/api/event', eventRouter);
app.use('/api/task', taskRouter);
app.use('/api/school/users', schoolUserRouter);
app.use('/api/school/teacher', teacherRouter);
app.use('/api/school/principle', principleRouter);
app.use('/api/school/event', schoolEventRouter);
app.use('/api/school/task', schoolTaskRouter);
app.use('/api/school/student', schoolStudentRouter);
app.use('/api/school/class', schoolClassRouter);
app.use('/api/school/grade', schoolGradeRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

//mongodb connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Database connected');
  });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
