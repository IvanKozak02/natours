const express = require('express');
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect, restrictTo, logout
} = require('../controllers/authController');
const { getAllUsers, updateMe, deleteMe, deleteUser, updateUser, getMe, getUser, uploadFile, resizeImage } = require('../controllers/userController');


const userRouter = express.Router();


userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/logout', logout);
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:resetToken', resetPassword);

userRouter.use(protect);    // All of the middleware after that one are protected

userRouter.patch('/update-my-password', updatePassword);
userRouter.patch('/update-me',uploadFile,resizeImage, updateMe);
userRouter.delete('/delete-me', deleteMe);


userRouter.use(restrictTo('admin'));
userRouter.get('/', getAllUsers);
userRouter.get('/me', getMe, getUser);
userRouter.route('/:id')
  .delete(deleteUser)
  .patch(updateUser);



module.exports = userRouter;

