const catchAsync = require("../utils/catchAsync");
const Class = require("../models/classModel");
const appError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
exports.getAllClasses = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Class.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const classess = await features.query;
  res.status(200).json({
    message: "Sucess",
    count: classess.length,
    data: {
      classess,
    },
  });
});
exports.getClassSubjects = catchAsync(async (req, res, next) => {
  const classId = req.params.classId;

  // Execute the Mongoose Query to find the class
  Class.findOne({ _id: classId })
    .then((selectedClass) => {
      if (!selectedClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      console.log(selectedClass);

      // Convert the Mongoose document to a plain JavaScript object
      const classObject = selectedClass.toObject();

      const subjects = classObject.subjects;
      console.log(subjects);
      res.status(200).json({
        message: "Sucess",
        data: {
          subjects,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    });
});
exports.getClassStudents = catchAsync(async (req, res, next) => {
  const classId = req.params.classId;

  // Execute the Mongoose Query to find the class
  Class.findOne({ _id: classId })
    .then((selectedClass) => {
      if (!selectedClass) {
        return res.status(404).json({ message: "Class not found" });
      }
      console.log(selectedClass);

      // Convert the Mongoose document to a plain JavaScript object
      const classObject = selectedClass.toObject();

      const students = classObject.students;
      // console.log(subjects);
      res.status(200).json({
        message: "Sucess",
        data: {
          students,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    });
});
exports.getSubject = catchAsync(async (req, res, next) => {
  const subjectCode = parseInt(req.params.subjectCode); // Parse the subject code to an integer
  console.log(subjectCode);

  // Execute the Mongoose Query to find the class
  Class.findOne({ subjectcode: subjectCode })
    .then((selectedClass) => {
      if (!selectedClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Convert the Mongoose document to a plain JavaScript object
      const classSubjects = selectedClass.subjects;

      // Find the subject with the matching subjectcode
      const subject = classSubjects.find(
        (subject) => subject.subjectcode === subjectCode
      );

      if (!subject) {
        return res
          .status(404)
          .json({ message: "Subject not found in this class" });
      }

      // If the subject is found, you can send it as a response
      res.status(200).json({
        message: "Success",
        data: {
          subject,
        },
      });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    });
});

exports.updateSubject = catchAsync(async (req, res, next) => {
  try {
    const classId = req.params.classId;
    const subjectCode = parseInt(req.params.subjectCode);
    const newTeacher = req.body.subjectTeacher; // Assuming you send the new teacher's name in the request body

    // Use findByIdAndUpdate to update the subject
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        $set: { "subjects.$[elem].subjectTeacher": newTeacher },
      },
      {
        new: true, // To return the updated document
        arrayFilters: [{ "elem.subjectcode": subjectCode }],
      }
    );

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Find the updated subject by subjectCode
    const updatedSubject = updatedClass.subjects.find(
      (subject) => subject.subjectcode === subjectCode
    );

    if (!updatedSubject) {
      return res
        .status(404)
        .json({ message: "Subject not found in this class" });
    }

    res.status(200).json({
      message: "Subject teacher updated successfully",
      data: {
        updatedSubject: updatedSubject,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});
exports.updateClassSubjects = catchAsync(async (req, res, next) => {
  const classId = req.params.classId;
  const updatedSubjects = req.body.subjects; // Assuming you send an array of updated subjects in the request body

  // Execute the Mongoose Query to find the class
  Class.findOne({ _id: classId })
    .then((selectedClass) => {
      if (!selectedClass) {
        return res.status(404).json({ message: "Class not found" });
      }

      // Update only the subjects field with the provided data
      selectedClass.subjects = updatedSubjects;

      // Save the updated class
      return selectedClass
        .save()
        .then((updatedClass) => {
          // Convert the Mongoose document to a plain JavaScript object
          const subjects = updatedClass.toObject();
          res.status(200).json({
            message: "Success",
            data: {
              subjects,
            },
          });
        })
        .catch((err) => {
          console.error(err);
          return res
            .status(500)
            .json({ message: "Failed to save updated class" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    });
});
exports.updateClassStudents = catchAsync(async (req, res, next) => {
  const classId = req.params.classId;
  const updatedStudents = req.body.students;
  console.log(updatedStudents);

  // Execute the Mongoose Query to find the class
  const selectedClass = await Class.findOne({ _id: classId });

  if (!selectedClass) {
    return res.status(404).json({ message: "Class not found" });
  }

  console.log(selectedClass);
  // Update only the students field with the provided data
  selectedClass.students = updatedStudents;
  console.log(updatedStudents);

  // Save the updated class
  const updatedClass = await selectedClass.save();

  // Convert the Mongoose document to a plain JavaScript object
  const students = updatedClass;
  console.log(students);
  res.status(200).json({
    message: "Success",
    data: {
      students,
    },
  });
});

exports.getClass = catchAsync(async (req, res, next) => {
  const classess = await Class.findById(req.params.id);
  res.status(200).json({
    message: "Sucess",
    data: {
      classess,
    },
  });
});

exports.createClass = catchAsync(async (req, res, next) => {
  const createdclasses = await Class.create(req.body);
  // Send Response
  res.status(201).json({
    status: "Success",
    data: {
      createdclasses,
    },
  });
});

exports.updateClass = catchAsync(async (req, res, next) => {
  const classes = await Class.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // if user does not exist send error
  if (!classes) {
    return next(new appError("no classes found with that ID", 404));
  }

  // Send Response
  res.status(200).json({
    status: "success",
    data: {
      classes,
    },
  });
});

exports.deleteClass = catchAsync(async (req, res, next) => {
  const classes = await Class.findByIdAndDelete(req.params.id);

  if (!classes) {
    return next(new appError("no classes found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
