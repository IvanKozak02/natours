const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const errorController = require('./controllers/errorController');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes')
const viewRouter = require('./routes/viewRoutes')
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('express');



const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// Body parser, reading data from body to req.body
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/public`));

// Set security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);




app.use(cookieParser())

// middleware (step that request will go through before it will be processed; req -> middleware -> res)
// function that modifies the incoming req data
// this data middleware will include body data from http post request in req object that will be
// received in resource handler function


// Development logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 100,                                                                 // allow 100 request
  windowMs: 60 * 60 * 1000,                                                 // for 1 hour
  message: 'Too many request from this API. Please try again in 1 hour.'    // error message
});




app.use('/api', limiter);   // affect all of the routes with /api
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());

app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
app.use('/', viewRouter)


app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!!!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);           // this error falls down to the global Error Handler
});


app.use(errorController);


module.exports = app;






