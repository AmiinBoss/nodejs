const mongoose = require("mongoose");
// const validator = require('validator')

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const dashboardSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    area: {
      type: String,
    },
    studentId: {
      type: String,
    },
    department: {
      type: String,
    },
    subjectStatus: {
      type: String,
      enum: ["absent", "present"],
    },
    timeAttended: {
      type: String,
    },
  },
  opts
);

const Dashboard = mongoose.model("dashboard", dashboardSchema);

module.exports = Dashboard;
