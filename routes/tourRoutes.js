const express = require('express');
const {
  getAllTours,
  createNewTour,
  getTour,
  updateTour,
  topTours,
  getTourStats,
  getMonthlyPlan,
  deleteTour, getToursWithin, getDistances, uploadTourFile, resizeTourImage
} = require('../controllers/tourController');
const { protect, restrictTo } = require('../controllers/authController');
const reviewController = require('./reviewRoutes');
const router = express.Router();


router.use('/:tourId/reviews', reviewController);

router.route('/tour-stats')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getTourStats);

router.route('/top-5-tours')
  .get(topTours, getAllTours);

router.route('/monthly-plan')
  .get(getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit')
  .get(getDistances);

router.route('/')
  .get(getAllTours)
  .post(protect,
    restrictTo('admin', 'lead-guide'),
    createNewTour);

router.route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), uploadTourFile, resizeTourImage, updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);


module.exports = router;