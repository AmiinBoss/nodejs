const mongoose = require("mongoose");
const validator = require("validator");
const ContactSchema = require("../schema/ContactSchema");

const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const employeeSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    employeeId: {
      type: String,
      unique: true,
      required: true,
    },
    hired_date: {
      type: Date,
      default: new Date(),
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "register", "user"],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please enter valid email"],
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
    classPeriods: [
      {
        dayOfWeek: {
          type: String,
          enum: [
            "Saturday",
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
          ],
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
      },
    ],
    teachingAssignments: [
      {
        classId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
        subjectCode: Number,
      },
    ],
  },
  opts
);

// Create a virtual property `fullName` that's computed from `first_name`, `middle_name` and `last_name`.

// auto generate employee ID
// employeeSchema.pre("validate", async function (next) {
//     //sorting students
//     const employees = await Employee.find({}).sort([["employeeId", -1]]);
//     if (employees.length > 0) {
//         this.employeeId = employees[0].employeeId + 1;
//     }
//     next();
// });

const Employee = mongoose.model("employee", employeeSchema);

module.exports = Employee;
