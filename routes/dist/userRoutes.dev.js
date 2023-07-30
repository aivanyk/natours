"use strict";

var express = require('express');

var userController = require('../controllers/userController');

var authController = require('../controllers/authController');

var multer = require('multer');

var upload = multer({
  dest: 'public/img/users'
});
var Router = express.Router();
Router.post('/signup', authController.signup);
Router.post('/login', authController.login);
Router.get('/logout', authController.logout);
Router.post('/forgotPassword', authController.forgotPassword);
Router.patch('/resetPassword/:token', authController.resetPassword);
Router.use(authController.protect);
Router.patch('/updatePassword', authController.updatePassword);
Router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, // upload.single('photo'),
userController.updateMe);
Router["delete"]('/deleteMe', userController.deleteMe);
Router.get('/me', userController.getMe, userController.getUser);
authController.restrictTo('admin');
Router.route('/').get(userController.getAllUser); // .post(userController.createUser);

Router.route('/:id').get(userController.getUser).patch(userController.updateUser)["delete"](userController.deleteUser);
module.exports = Router;