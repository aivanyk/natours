"use strict";

var express = require('express');

var fs = require('fs');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp');

var path = require('path');

var cookieParser = require('cookie-parser');

var AppError = require('./utils/appError');

var globalErrorHandler = require('./controllers/errorController');

var app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); //middlewares
//Security HTTP headers

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
})); //Development login

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} //Limit request from same api


var limiter = rateLimit({
  max: 1000,
  window: 3600 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter); //Body parser, reading data from body into req.body

app.use(express.json({
  limit: '10kb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10kb'
}));
app.use(cookieParser()); //Data sanitization against NoSQL query injection

app.use(mongoSanitize()); //Data sanitization against XSS

app.use(xss()); //Prevent parameter pollution

app.use(hpp({
  whitelist: ['duration', 'ratingsQuatity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
})); //Serving static files

app.use(express["static"](path.join(__dirname, 'public'))); //Test middleware

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString(); // console.log(req.cookies);

  next();
}); //route

var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRoutes');

var reviewRouter = require('./routes/reviewRoutes');

var bookingRouter = require('./routes/bookingRoutes');

var viewRouter = require('./routes/viewRoutes');

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.all('*', function (req, res, next) {
  // const err = new Error(`cannot find ${req.originalUrl}`);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  next(new AppError("cannot find ".concat(req.originalUrl), 404));
});
app.use(globalErrorHandler); // app.use((err, req, res, next) => {
//   console.log(err.stack);
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || 'error';
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//   });
// });

module.exports = app;