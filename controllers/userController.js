const User = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const { deleteOne, updateOne, getAll, getOne } = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });
//
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {     // test if the uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Not an image. Please upload images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
//
exports.uploadFile = upload.single('photo');

// upload.single('fieldName')   ---- 1 image
// upload.array('fieldName', 4) ---- 4 images with the same name
// upload.fields({name: 'fieldName', maxCount: 3}, {}, {}, ...) ---- mix


exports.resizeImage = async (req, res, next) => {     // resizing image in cases when it is not in square shape (rectangle)
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
};





const filterObj = (obj, ...allowedFields) => {
  let newObj = {};
  Object.keys(obj).forEach(key => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};


exports.getAllUsers = getAll(User);



exports.updateMe = async (req, res, next) => {
  // 1) Create error if user posts password data
  console.log(req.file);
  console.log(req);
  if (req.body.password || req.body.passwordConfirm)
    return next(new ApiError(400, 'This route is not for password updates. Please use /update-my-password'));
  // 2) Update user document
  try {
    const filteredBody = filterObj(req.body, 'name', 'email');
    if (req.file) {
      filteredBody.photo = req.file.filename;
      console.log(filteredBody);
    }
    const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
      new: true,
      runValidators: true
    });
    return res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (err) {
    return next(new ApiError(500, 'Cannot update current user. Try again later.'));
  }
};

exports.updateUser = updateOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = getOne(User);

exports.deleteMe = async (req, res, next) => {      // User is not deleted from DB we just disactivate their password
  await User.findByIdAndUpdate(req.user._id, { active: false });
  return res.status(204).json({
    status: 'success'
  });
};

exports.deleteUser = deleteOne(User);