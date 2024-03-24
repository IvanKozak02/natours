const Tour = require('../models/tourModel');
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory');
const ApiError = require('../utils/ApiError');
const multer = require('multer');
const sharp = require('sharp');


const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {     // test if the uploaded file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Not an image. Please upload images.'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});
//
exports.uploadTourFile = upload.fields([
  {
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);

// upload.single('fieldName')   ---- 1 image
// upload.array('fieldName', 4) ---- 4 images with the same name
// upload.fields({name: 'fieldName', maxCount: 3}, {}, {}, ...) ---- mix


exports.resizeTourImage = async (req, res, next) => {     // resizing image in cases when it is not in square shape (rectangle)
  if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];
  await Promise.all(req.files.images.map(async (file, index) => {
    const filename = `tour-${req.params.id}-${Date.now()}-image-${index + 1}.jpeg`;
    await sharp(file.buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${filename}`);
    req.body.images.push(filename);
  }));
  next();

};


exports.topTours = (req, res, next) => {
  req.query = {
    limit: 5,
    sort: '-ratingsAverage price'
  };
  next();
};

exports.getAllTours = getAll(Tour);
exports.getTour = getOne(Tour, { path: 'reviews' });
exports.createNewTour = createOne(Tour);
exports.updateTour = updateOne(Tour);
exports.deleteTour = deleteOne(Tour);


exports.getTourByQueryParam = async (req, res) => {
  return res.status(204).json({ status: 'success', data: [] });
};


exports.getTourStats = async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 5 } }
    },
    {
      $group: {
        _id: '$difficulty',    //  3 group
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
        numberOfRatings: { $sum: '$ratingsQuantity' },
        numberOfTours: { $sum: 1 }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }

  ]);
  return res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
};


exports.getMonthlyPlan = async (req, res) => {
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numberOfTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numberOfTours: -1 }
    },
    {
      $limit: 6
    }
  ]);
  return res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
};

exports.getToursWithin = async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(new ApiError('Please provide lat and lng in format lat,lng.'));
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });
  return res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
};

exports.getDistances = async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    return next(new ApiError('Please provide lat and lng in format lat,lng.'));
  }
  const multiplier = unit === 'mi' ? 0.000621 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);
  distances.map(dist => ({ ...dist, distance: dist.distance / 1000 }));
  return res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
};