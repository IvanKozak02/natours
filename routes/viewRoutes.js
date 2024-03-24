const express = require('express');
const { getOverviewPage, getTourPage, getLoginPage, getMyProfile, getMyTours } = require('../controllers/viewController');
const { protect, isLoggedIn } = require('../controllers/authController');
const { createBookingCheckout } = require('../controllers/bookingController');

const router = express.Router();
// router.use(isLoggedIn)
router.get('/',createBookingCheckout,isLoggedIn, getOverviewPage);
router.get('/login', getLoginPage)
router.get('/tour/:id', protect, isLoggedIn,getTourPage);
router.get('/me', protect,isLoggedIn,getMyProfile);
router.get('/my-tours', protect, getMyTours);
router.patch('/update-settings', )

module.exports = router;