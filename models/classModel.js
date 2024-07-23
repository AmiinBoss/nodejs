const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const classSchema = mongoose.Schema(
  {
    classCode: {
      type: Number,
      unique: true,
    },
    className: {
      type: String,
    },
    createdDate: {
      type: String,
    },
    status: {
      type: String,
    },
    department: {
      type: String,
    },
    subjects: {
      type: Array,
      default: [],
    },
    students: {
      type: Array,
      default: [],
    },
  },
  opts
);
const Class = mongoose.model("class", classSchema);

module.exports = Class;
