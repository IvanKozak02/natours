const mongoose = require('mongoose');
const slugify = require('slugify');
const { raw } = require('express');
const validator = require('validator');
const User = require('./userModel')
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: [true, 'A tour with such a name already exists!!!'],
  },
  duration: {
    type: Number,
    required: [true, 'A tour must have a duration!!!']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour must have a size!!!']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour must have a size!!!'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'A tour could be ease, medium or difficult!!!'
    }
  },
  price: {
    type: Number,
    required: [true, 'You must define the price of the tour!!!']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function(val){
        return val < this.price;
      },
      message: 'Discount price should be less than regular price!!!'
    }
  },
  ratingsAverage: {
    type: Number,
    default: 4,
    set: val => Math.round(val * 10) / 10,
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  summary: {
    type: String,
    trim: true,     // remove whitespaces at the beginning and at the end of string
    required: [true, 'A tour must have a description!!!']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour must have an cover image!!!']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),    // mongo will automatically convert this time in milliseconds to normal date
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false,
  },
  startLocation:{
    // GeoJSON
    type:{
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],   // array of points
    address: String,
    description: String,
  },
  locations: [
    {
      type:{
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'user',
    }
  ],
}, {
  toJSON: {virtuals: true},
  toObject: {virtuals: true},
});

tourSchema.index({startLocation: '2dsphere'})
tourSchema.index({price: 1});

tourSchema.virtual('durationInWeek').get(function() {
  return this.duration / 7;
});


tourSchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'tour',
  localField: '_id',
})

tourSchema.pre(/^find/, function(next){
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
})

// Embedding


// tourSchema.pre('save', async function(next){
//   const guidesPromises = this.guides.map(async guideId=>await User.findById(guideId))
//   this.guides = await Promise.all(guidesPromises);
//   next()
// })

// tourSchema.pre('save', function(next) {   // executes before doc will be saved
//
// })
//
// tourSchema.post('save', function(doc, next) {  // executes after doc will be saved
//   console.log(doc);
//   next();
// })


tourSchema.pre(/^find/, async function(next) {
  this.find({secretTour: {$ne: true}});
  this.start = Date.now();
    next()
})


tourSchema.post(/^find/, async function(docs,next) {
  this.end = this.start - Date.now()
  next()
})


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;