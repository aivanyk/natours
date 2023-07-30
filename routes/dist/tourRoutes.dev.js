"use strict";

var express = require('express');

var tourController = require('../controllers/tourController');

var authController = require('../controllers/authController'); // const reviewController = require('../controllers/reviewController');


var reviewRouter = require('./reviewRoutes');

var Router = express.Router(); // Router.param('id', tourController.checkID);

Router.use('/:tourId/reviews', reviewRouter);
Router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTour);
Router.route('/tour-stats').get(tourController.getTourStats);
Router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);
Router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin);
Router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
Router.route('/').get(tourController.getAllTour).post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour);
Router.route('/:id').get(tourController.getTour).patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.uploadTourImages, tourController.resizeTourImages, tourController.updateTour)["delete"](authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);
module.exports = Router;