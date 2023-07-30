"use strict";

var express = require('express');

var bookingController = require('../controllers/bookingController');

var authController = require('../controllers/authController');

var router = express.Router();
router.use(authController.protect);
router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);
router.use(authController.restrictTo('admin', 'lead-guide'));
router.route('/').get(bookingController.getAllBooking).patch(bookingController.createBooking)["delete"](bookingController.deleteBooking);
router.route('/:id').get(bookingController.getBooking).post(bookingController.updateBooking);
module.exports = router;