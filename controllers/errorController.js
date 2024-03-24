const ApiError = require('../utils/ApiError');
const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  }
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });

};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!'
    });
  } else {
    if (err.isOperational) {
      res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please, try again later.'
      });
    }
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!!'
    });
  }
};


const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleJWTError = err => {
  const message = `Invalid token. Please login again.`;
  return new ApiError(401, message);
};


const handleTokenExpiredError = err => {
  const message = `Token expired. Please login again.`;
  return new ApiError(401, message);
};

module.exports = ((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);
    sendErrorProd(error, req, res);
  }


});