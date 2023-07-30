"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AppError = require('../utils/appError');

var sendErrorDev = function sendErrorDev(err, req, res) {
  //Api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } //Render


  console.error('ERROR!!!!!', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

var sendErrorProd = function sendErrorProd(err, req, res) {
  //Api
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } //Programming, unknown error


    console.error('ERROR!!!!!', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      detail: err
    });
  } //Render


  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    }); //Programming, unknown error
  } else {
    console.error('ERROR!!!!!', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later'
    });
  }
};

var handleCastErrorDB = function handleCastErrorDB(err) {
  var message = "Invalid ".concat(err.path, ": ").concat(err.value);
  return new AppError(message, 400);
};

var handleDuplicateErrorDB = function handleDuplicateErrorDB(err) {
  var val = err.keyValue.name;
  var message = "Duplicate field value: ".concat(val, ", please change one");
  return new AppError(message, 400);
};

var handleValidateErrorDB = function handleValidateErrorDB(err) {
  var errors = Object.values(err.errors).map(function (el) {
    return el.message;
  });
  var message = "Invalid input data. ".concat(errors.join('. '));
  return new AppError(message, 400);
};

var handleJWTErrorDB = function handleJWTErrorDB(err) {
  return new AppError('Invalid token. Please login again', 401);
};

var handleJWTExpiredErrorDB = function handleJWTExpiredErrorDB(err) {
  return new AppError('Token expired. Please login again', 401);
};

module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    var error = _objectSpread({}, err);

    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidateErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTErrorDB(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredErrorDB(error);
    sendErrorProd(error, req, res);
  }
};