const AppError = require('../utils/appError');

const sendErrorDev = (err, req, res) => {
  //Api
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //Render
  console.error('ERROR!!!!!', err);
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  //Api
  if (req.originalUrl.startsWith('/api')) {
    //Operational, trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //Programming, unknown error
    console.error('ERROR!!!!!', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
      detail: err,
    });
  }
  //Render
  if (err.isOperational) {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });

    //Programming, unknown error
  } else {
    console.error('ERROR!!!!!', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: 'Please try again later',
    });
  }
};

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const val = err.keyValue.name;
  const message = `Duplicate field value: ${val}, please change one`;
  return new AppError(message, 400);
};

const handleValidateErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTErrorDB = (err) =>
  new AppError('Invalid token. Please login again', 401);

const handleJWTExpiredErrorDB = (err) =>
  new AppError('Token expired. Please login again', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError')
      error = handleValidateErrorDB(error);
    if (err.name === 'JsonWebTokenError')
      error = handleJWTErrorDB(error);
    if (err.name === 'TokenExpiredError')
      error = handleJWTExpiredErrorDB(error);
    sendErrorProd(error, req, res);
  }
};
