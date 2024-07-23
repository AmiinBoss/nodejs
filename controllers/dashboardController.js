// const Employee = require("../models/employeeModel");
const appError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const Dashoard = require("../models/dashboardModel");
const catchAsync = require("../utils/catchAsync");
const { v4: uuidv4 } = require("uuid");
exports.getDashboard = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Dashoard.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const dashboard = await features.query;
  res.status(200).json({
    message: "Sucess",
    count: dashboard.length,
    data: {
      dashboard,
    },
  });
  if (!dashboard) {
    return next(new appError("no dashboard found ", 404));
  }
  next();
});
exports.createDashboard = catchAsync(async (req, res, next) => {
  req.body.studentId = uuidv4();
  const createdDashboard = await Dashoard.create(req.body);
  // Send Response
  res.status(201).json({
    status: "Success",
    data: {
      createdDashboard,
    },
  });
});
exports.deleteDashboard = catchAsync(async (req, res, next) => {
  const dashboard = await Dashoard.findByIdAndDelete(req.params.id);

  if (!dashboard) {
    return next(new appError("no dashboard found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
