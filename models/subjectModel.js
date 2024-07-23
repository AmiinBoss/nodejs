const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };
const subjectSchema = mongoose.Schema(
  {
    subjectCode: {
      type: Number,
      default: 1,
      unique: true,
    },
    subjectName: {
      type: String,
    },
    createdDate: {
      type: String,
      default: new Date(),
    },
    department: {
      type: String,
    },
  },
  opts
);

// auto generate subject id  ID
subjectSchema.pre("validate", async function (next) {
  //sorting students
  const subjects = await Subject.find({}).sort([["subjectCode", -1]]);
  if (subjects.length > 0) {
    this.subjectCode = subjects[0].subjectCode + 1;
  }
  next();
});

const Subject = mongoose.model("subject", subjectSchema);

module.exports = Subject;
