const express = require('express');
const { protect } = require('../controllers/authController');
const { getCheckoutSession } = require('../controllers/bookingController');

const router = express.Router();

router.get('/create-checkout-session/:tourId', protect, getCheckoutSession)

module.exports = router;
