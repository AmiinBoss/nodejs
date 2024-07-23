const mongoose = require("mongoose");
const validator = require("validator");
const ContactSchema = require("../schema/ContactSchema");

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const studentSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    motherName: {
      type: String,
      required: true,
      lowercase: true,
    },
    department: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    studentId: {
      type: String,
      unique: true,
      required: true,
    },
    registered_date: {
      type: Date,
      default: new Date(),
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "absent",
      enum: ["absent", "present"],
    },
  },
  opts
);

const Student = mongoose.model("student", studentSchema);

module.exports = Student;
