const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const jwt = require('jsonwebtoken');
const util = require('util');
const sendEmail = require('../utils/email');
const crypto = require('crypto');
const Email = require('./../utils/email');


const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {   // login user just after registration
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  console.log(token);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true       // cookie cannot be modified by the browser
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;   // cookie will be sent only with HTTPS
  }
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  return res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user: user
    }
  });
};


exports.signup = async (req, res, next) => {
  try {
    console.log(req.body);
    const newUser = await User.create(req.body);
    console.log(newUser);
    const url = `${req.protocol}://${req.get('host')}/me`;
    console.log(Email);
    await new Email(newUser, url).sendWelcome();
    createAndSendToken(newUser, 201, res);

  } catch (err) {
    // next(new ApiError(400, 'Cannot create new user!!!'));
    res.status(400).json({message: err.message})
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(email, password);
  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new ApiError(400, 'Please provide correct email and password!!!'));
  }
  // 2) Check if the user exist && password is correct
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {             // more secure (we cannot specify what is incorrect email or password)
    return next(new ApiError(401, 'Incorrect email or password!!!'));
  }
  // 3) If everything is OK send the token to the client
  createAndSendToken(user, 200, res);

};

exports.logout = (req,res)=>{
  res.cookie('jwt', 'bye-bye', {
    expires: new Date(Date.now() + 10 * 1000),
  })
  res.status(200).json({status: 'success'});
}

exports.isLoggedIn = async (req, res, next) => {       // Protect routes (Check if user have access to some routes)
  // 1) Get token and check if it exist
  if (req.cookies.jwt) {
    // 2) Verification token
    try {
      const decoded = await util.promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      // 3) Check if user still exists
      const user = await User.findById(decoded.id);
      if (!user) {                                             // when we have token and do not have user in DB (probably, he was deleted)
        return next();
      }
      // 4) Check if user changed password after jwt was issued
      if (user.changedPasswordAfter(decoded.iat)) {
        return next();
      }
      res.locals.user = user;
      console.log(user);
    } catch (err) {
      return next();
    }
  }
  next();
};


exports.protect = async (req, res, next) => {       // Protect routes (Check if user have access to some routes)
  // 1) Get token and check if it exist
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new ApiError(401, 'You are not logged in. Please login to get access.'));
  }
  // 2) Verification token
  try {
    const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // 3) Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {                                             // when we have token and do not have user in DB (probably, he was deleted)
      return next(new ApiError(401, 'The user that token belonged to is not already exist.'));
    }

    // 4) Check if user changed password after jwt was issued
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(new ApiError(401, 'User recently changed password. Please login again.'));
    }
    req.user = user;
    console.log(user);
  } catch (err) {
    next(new ApiError(401, 'Invalid Token!!!'));
  }
  next();
};

exports.restrictTo = (...roles) => {      // Authorization
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };
};

exports.forgotPassword = async (req, res, next) => {
  // 1) Get user by posted email
  let user;
  try {
    const { email } = req.body;
    user = await User.findOne({ email });
    if (!user) {
      return next(new ApiError(404, 'There is no user with that email address.'));
    }
    // 2) Generate random reset token
    const resetToken = user.createPasswordResetToken();

    await user.save({ validateBeforeSave: false });     // save passwordResetToken + passwordResetExpires

    // 3) send token to the user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, resetURL).sendPasswordReset();
    return res.status(200).json({
      status: 'success',
      message: 'Token was sent to the email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    next(new ApiError(500, 'There was an error sending the email. Try again later.'));
  }
};


exports.resetPassword = async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.resetToken)
    .digest('hex');

  // 2) If token has not expired and there is a user, set the new password
  try {
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    if (!user) {
      return next(new ApiError(404, 'Token is invalid or is expired.'));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // 3) Update changedPassword at property
    // 4) Log user in; send jwt
    createAndSendToken(user, 200, res);
  } catch (err) {
    next(new ApiError(400, 'Bad request!'));
  }
};

exports.updatePassword = async (req, res, next) => {
  // 1) Get user from DB
  const user = await User.findById(req.user._id).select('+password');

  console.log(user);
  console.log(req.body);
  // 2) Check if posted password is correct
  if (!user.correctPassword(req.body.currentPassword, user.password)) {
    return next(new ApiError(401, 'Incorrect password.'));
  }
  // 3) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();


  // 4) Log user in with new password
  createAndSendToken(user, 200, res);

};