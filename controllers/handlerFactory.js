const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const a = await Model.findByIdAndDelete(req.params.id);
    if (!a) {
      return next(
        new AppError('No document found with that id!', 404),
      );
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!doc) {
      return next(
        new AppError('no document found with that id!', 404),
      );
    }
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    //   newReview.user
    res.status(201).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let q = Model.findById(req.params.id);
    if (popOptions) {
      q = q.populate(popOptions);
    }
    const a = await q;

    if (!a) {
      return next(new AppError('no doc found with that id!', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { data: a },
    });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //execute query
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limit()
      .paginate();
    const doc = await features.query;
    // const doc = await features.query.explain();

    //send response

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });
