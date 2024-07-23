const catchAsync = require("./../utils/catchAsync");
const Employee = require("../models/employeeModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const File = require("../models/fileModel");
const Chunk = require("../models/chunkModel");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const axios = require("axios");
const { GridFsStorage } = require("multer-gridfs-storage");

const mongoURI = `mongodb://localhost:27017/${process.env.DATABASE_NAME}`;

// Create storage engine
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      const filename = `${new Date()}${file.originalname}`;
      console.log(filename);
      const fileInfo = {
        filename: filename,
        bucketName: "uploads",
      };
      resolve(fileInfo);
    });
  },
});

const multerFilter = async (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    await File.deleteMany();
    await Chunk.deleteMany();
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: multerFilter,
});

exports.uploadImage = upload.single("image");

exports.getAllEmployees = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Employee.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const employees = await features.query;
  res.status(200).json({
    message: "Sucess",
    count: employees.length,
    data: {
      employees,
    },
  });
});

exports.getEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  res.status(200).json({
    message: "Sucess",
    data: {
      ...employee,
    },
  });
});

const checkForOverlappingPeriods = (classPeriods) => {
  for (let i = 0; i < classPeriods.length; i++) {
    for (let j = i + 1; j < classPeriods.length; j++) {
      if (
        classPeriods[i].dayOfWeek === classPeriods[j].dayOfWeek &&
        ((classPeriods[i].startTime <= classPeriods[j].startTime &&
          classPeriods[i].endTime > classPeriods[j].startTime) ||
          (classPeriods[j].startTime <= classPeriods[i].startTime &&
            classPeriods[j].endTime > classPeriods[i].startTime))
      ) {
        return true; // overlapping found
      }
    }
  }
  return false; // no overlapping
};

exports.createEmployee = catchAsync(async (req, res, next) => {
  if (typeof req.body.classPeriods === "string") {
    req.body.classPeriods = JSON.parse(req.body.classPeriods);
  }
  if (checkForOverlappingPeriods(req.body.classPeriods)) {
    return next(new AppError("Overlapping class periods detected", 400));
  }

  const image = await getImage(req.file.filename);
  if (typeof req.body.teachingAssignments === "string") {
    req.body.teachingAssignments = JSON.parse(req.body.teachingAssignments);
  }
  const createdEmployee = await Employee.create({
    ...req.body,
    teachingAssignments: req.body.teachingAssignments,
    imageUrl: image,
  });

  // Retrieve the class ID based on the employee's class name
  const employeeClassName = createdEmployee.area;
  const classId = await getClassIdByClassName(employeeClassName);

  // Check if classId exists
  if (!classId) {
    return next(
      new AppError(`Class with name ${employeeClassName} not found.`, 404)
    );
  }

  // Update the specific class with the new employee's data
  await updateClassWithEmployeeData(
    classId,
    req.body.classPeriods,
    req.body.teachingAssignments
  );

  // Send Response
  res.status(201).json({
    status: "Success",
    data: {
      createdEmployee,
    },
  });
});

exports.updateEmployee = catchAsync(async (req, res, next) => {
  if (typeof req.body.classPeriods === "string") {
    req.body.classPeriods = JSON.parse(req.body.classPeriods);
  }
  if (checkForOverlappingPeriods(req.body.classPeriods)) {
    return next(new AppError("Overlapping class periods detected", 400));
  }

  if (typeof req.body.teachingAssignments === "string") {
    req.body.teachingAssignments = JSON.parse(req.body.teachingAssignments);
  }

  const image = req.file && (await getImage(req.file.filename));
  const employee = await Employee.findByIdAndUpdate(
    req.params.id,
    { ...req.body, image },
    {
      new: true,
      runValidators: true,
    }
  );

  // Retrieve the class ID based on the employee's class name
  const employeeClassName = employee.area; // Use the updated employee data
  const classId = await getClassIdByClassName(employeeClassName);

  // Check if classId exists
  if (!classId) {
    return next(
      new AppError(`Class with name ${employeeClassName} not found.`, 404)
    );
  }

  // Update the specific class with the new employee's data
  await updateClassWithEmployeeData(
    classId,
    req.body.classPeriods,
    req.body.teachingAssignments
  );

  // Send Response
  res.status(200).json({
    status: "success",
    data: {
      employee,
    },
  });
});

async function updateClassWithEmployeeData(
  classId,
  classPeriods,
  teachingAssignments
) {
  try {
    const classEndpoint = `http://127.0.0.1:800/api/v1/classes/${classId}/subjects`;

    // Fetch the class by its ID to update the subjects with the employee's data
    const classData = await axios.get(classEndpoint);
    console.log("class data is : ", classData.data);
    const updatedSubjects = classData?.data?.data?.subjects;
    console.log("updated subjects are ", updatedSubjects);
    // Check and update the subjects in the class with the new employee's data
    // Here, you need to modify 'updatedSubjects' using the 'classPeriods' and 'teachingAssignments'
    // and then update the class via a PUT request
    updatedSubjects.push({ classPeriods, teachingAssignments }); // This is a basic example, modify it according to your data structure
    // Make a PUT request to update the class with the modified subjects array
    await axios.patch(classEndpoint, { subjects: updatedSubjects });
  } catch (error) {
    console.error("Error updating class with employee data:", error);
    // Handle errors or failures in updating the class
    // For example, you can choose to log the error or handle it as needed
  }
}

exports.deleteEmployee = catchAsync(async (req, res, next) => {
  const employee = await Employee.findByIdAndDelete(req.params.id);

  if (!employee) {
    return next(new AppError("no employee found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

const getImage = async (fileName) => {
  try {
    const file = await File.find({ filename: fileName });

    const id = mongoose.Types.ObjectId(file[0]._id);

    const chunks = await Chunk.find({ files_id: id });

    if (!chunks || chunks.length === 0) {
      console.log("No data found");
    }

    let fileData = [];
    for (let i = 0; i < chunks.length; i++) {
      //This is in Binary JSON or BSON format, which is stored
      //in fileData array in base64 endocoded string format
      fileData.push(chunks[i].data.toString("base64"));
    }

    console.log(file);
    const base64 = file[0].contentType.toString("base64");

    //Display the chunks using the data URI format
    return "data:" + file[0].contentType + ";base64," + fileData.join(" ");
  } catch (error) {
    return new AppError(error.message, error.statusCode);
  }
};

async function getClassIdByClassName(employeeClassName) {
  try {
    const classesResponse = await axios.get(
      "http://127.0.0.1:800/api/v1/classes/"
    );
    const classesData = classesResponse.data.data.classess;

    // Find the class object based on the provided employeeClassName
    const foundClass = await classesData.find(
      (cls) => cls.className === employeeClassName
    );

    if (foundClass) {
      const classId = foundClass._id;
      return classId;
    } else {
      return null; // If the class with the employeeClassName is not found
    }
  } catch (error) {
    // Handle errors with fetching the API
    console.error("Error fetching class data:", error);
    throw error; // You might want to handle or re-throw this error as needed
  }
}
