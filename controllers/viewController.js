const Tour = require('../models/tourModel');
const Review = require('../models/reviewModel');
const ApiError = require('../utils/ApiError');
const Booking = require('../models/bookingModel');


exports.getOverviewPage = async (req, res, next) => {
  // 1) Get data from collection
  try {
    const tours = await Tour.find();
    // 2) Build Template

    // 3) Render overview page

    res.status(200).render('overview', {
      title: 'Overview',
      tours
    });
  } catch (err) {
    next(err);
  }

};
exports.getTourPage = async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  if (!tour) {
    return next(new ApiError(404, 'Tour was not found.'));
  }
  const reviews = await Review.find({ tour: tour._id });
  res.status(200).render('tourPage', {
    title: `${tour.name} Tour`,
    tour,
    reviews
  });
};

exports.getLoginPage = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account'
  });
};

exports.getMyProfile = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account'
  });
};

exports.getMyTours = async (req, res,next) => {
  try {
    console.log(req.user);
    const bookings = await Booking.find({user: req.user._id});
    console.log(bookings);
    const bookingIds = bookings.map(booking=> booking.id);
    const tours =  await Tour.find({_id: {$in: bookingIds}});
    // console.log(tours);
    res.status(200).render('overview', {
      title: 'All tours',
      tours,
    })
  }catch (err){
    console.log(err);
  }
};
