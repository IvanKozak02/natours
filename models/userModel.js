const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username cannot be empty!!!'],
    minlength: [2, 'Username cannot consists from only 1 letter!!!']
  },
  photo: {
    type: String,
    required: true,
    default: 'default.jpg'
  },

  email: {
    type: String,
    validate: [validator.isEmail, 'Email is not valid!!!'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password cannot be empty'],
    minlength: [8, 'Password cannot be less than 8 symbols!!!'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password cannot be empty'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords don`t match!!!'
    }
  },
  changedPasswordAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});


// userSchema.pre(/^find/, function(next) {      // query middleware (FIND)
//   // this points to QUERY
//   this.find({ active: {$ne: false }});
//   next();
// });
//
// userSchema.pre('save', async function(next) {     // document middleware (SAVE)
//   if (!this.isModified('password'))                  // check if password was modified
//     return next();
//   this.password = await bcrypt.hash(this.password, 12);   // this is a ref to current object; hash is async;
//   this.passwordConfirm = undefined;                       // because we need confirm password only for validation
//   next();
// });
//
// userSchema.pre('save', function(next) {
//   if (!this.isModified('password') || this.isNew) return next();
//   this.changedPasswordAt = Date.now() - 1000;
//   next();
// });


userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {    // methods for current schema
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {   // JWTTimeStamp - when token was issued
  if (this.changedPasswordAt) {
    const changedTimestamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');    // token that will be send to user's email
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');  // encrypted reset token
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('user', userSchema);

module.exports = User;