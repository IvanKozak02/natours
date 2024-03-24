const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);    // give us object we can work with
exports.getCheckoutSession = async (req, res, next) => {
  try {
    // 1) Get the currently booked tour
    const tour = await Tour.findById(req.params.tourId);
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`],
            },
            unit_amount: `${tour.price}`,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,   // url that will be called as soon as credit card was successfully charged
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${req.params.tourId}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
    });


    console.log(session);

    // 3) Send it to client
    return res.status(200).json({
      status: 'success',
      session
    });
  } catch (err) {
    next(err);
  }

};

exports.createBookingCheckout = async (req, res, next) =>{
  const {tour, user, price} = req.query;
  if (!tour || !user || !price) return next();
  await Booking.create({
    tour,
    user,
    price
  })
  res.redirect(req.originalUrl.split('?')[0]);
}