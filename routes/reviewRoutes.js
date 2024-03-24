const express = require('express');
const {
  getAllReviews,
  createNewReview,
  deleteReview,
  updateReview,
  setTourUserIds, getReview
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router({
  mergeParams: true
});

router.use(protect);

router.route('/')
  .get(getAllReviews)
  .post(
    restrictTo('user'),
    setTourUserIds,
    createNewReview
  );

router.route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), updateReview);

module.exports = router;
