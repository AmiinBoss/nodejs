const catchAsync = require("../utils/catchAsync");
const Subject = require("../models/subjectModel");
const appError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllsubjects = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Subject.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const subjects = await features.query;
  res.status(200).json({
    message: "Sucess",
    count: subjects.length,
    data: {
      subjects,
    },
  });
});

exports.getsubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findById(req.params.id);
  res.status(200).json({
    message: "Sucess",
    data: {
      subject,
    },
  });
});

exports.createsubject = catchAsync(async (req, res, next) => {
  const createdsubject = await Subject.create(req.body);
  // Send Response
  res.status(201).json({
    status: "Success",
    data: {
      createdsubject,
    },
  });
});

exports.updatesubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // if user does not exist send error
  if (!subject) {
    return next(new appError("no Subject found with that ID", 404));
  }

  // Send Response
  res.status(200).json({
    status: "success",
    data: {
      subject,
    },
  });
});

exports.deletesubject = catchAsync(async (req, res, next) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);

  if (!subject) {
    return next(new appError("no subject found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
