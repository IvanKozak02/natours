const Review = require('../models/reviewModel');
const { deleteOne, createOne, updateOne, getOne, getAll } = require('./handlerFactory');

exports.getAllReviews = getAll(Review);
exports.getReview = getOne(Review)
exports.updateReview = updateOne(Review);
exports.createNewReview = createOne(Review);
exports.deleteReview = deleteOne(Review);

exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

