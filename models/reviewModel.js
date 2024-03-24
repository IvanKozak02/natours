const mongoose = require('mongoose');
const { raw } = require('express');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
  review: {
    type: String,
    required: [true, 'Review cannot be empty']
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'tour',
    required: [true, 'Review must belong to some tour.']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: [true, 'Review must belong to some user.']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


reviewSchema.index({tour: 1, user: 1}, {unique: true})

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOne/, async function(next) {     // can use for ex. findOne, query is NOT EXECUTED YET
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOne/, async function() {    // in post mw we cannot do smth like that query.findOne(),
  // because query is already executed!!!!!!!!!
  // this -> document
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

reviewSchema.statics.calcAverageRatings = async function(tour) {    // this -> reviewSchema
  const stats = await this.aggregate([
    {
      $match: { tour }
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tour, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function() {
  this.constructor.calcAverageRatings(this.tour);
});


reviewSchema.pre(/^find/, function(next) {    // this ->//TODO Query
  this.populate({
    path: 'tours',
    select: true
  });
  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});


// reviewSchema.virtual('').get(function() {      // helper fields that do not save in DB
//   return this...
// })

const reviewModel = mongoose.model('review', reviewSchema);

module.exports = reviewModel;