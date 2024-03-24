const { Model } = require('mongoose');
const Tour = require('../models/tourModel');
const ApiError = require('../utils/ApiError');
const APIFeatures = require('../utils/apiFeatures');
exports.deleteOne = Model => async (req, res, next) => {
  try {
    console.log(req.params.id);
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return new ApiError('No document found with that ID!');
    }
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(new ApiError(400, 'Cannot delete document!!!'));
  }
};

// exports.createNewTour = async (req, res, next) => {
//   try {
//     const newTour = await Tour.create(req.body);
//     return res.status(201).json({
//       status: 'success',
//       data: {
//         newTour
//       }
//     });
//   } catch (err) {
//     next(new ApiError(404, err.message))
//   }
// };

exports.createOne = Model => async (req, res, next) => {
  try {
    const doc = await Model.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: {
        doc
      }
    });
  } catch (err) {
    next(new ApiError(404, err.message));
  }
};


// exports.updateTour = async (req, res) => {
//   try {
//     // const updatedTour = await Tour.updateOne({ _id: req.params.id }, { name: req.body.name});
//     const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//       new: true
//     });
//     return res.status(200).json({
//       status: 'success',
//       data: {
//         updatedTour
//       }
//     });
//
//   } catch (err) {
//     res.status(400).json({
//       status: 'fail',
//       message: 'Could not update tour!!!'
//     });
//   }
// };

exports.updateOne = Model => async (req, res, next) => {
  try {
    // const updatedTour = await Tour.updateOne({ _id: req.params.id }, { name: req.body.name});
    const updatedDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });
    return res.status(200).json({
      status: 'success',
      data: {
        updatedDoc
      }
    });

  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: 'Could not update document!!!'
    });
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      query = query.populate(popOptions);
    }
    const doc = await query;
    return res.status(200).json({
      status: 'success',
      data: {
        tour: doc
      }
    });
  } catch (err) {
    next(err);
  }
};


exports.getAll = Model => async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = {tour: req.params.tourId};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .pagination();
    const docs = await features.query;
    if (docs) {
      return res.status(200).json({ status: 'success', results: docs.length, docs });
    }
  } catch (err) {
    next(err)
  }
};