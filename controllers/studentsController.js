const catchAsync = require("./../utils/catchAsync");
const Student = require("../models/studentsModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const File = require("../models/fileModel");
const Chunk = require("../models/chunkModel");
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
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

exports.getAllstudents = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Student.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const students = await features.query;
  res.status(200).json({
    message: "Sucess",
    count: students.length,
    data: {
      students,
    },
  });
});

exports.getstudent = catchAsync(async (req, res, next) => {
  const student = await Student.findById(req.params.id);
  res.status(200).json({
    message: "Sucess",
    data: {
      ...student,
    },
  });
});

exports.createstudent = catchAsync(async (req, res, next) => {
  const image = await getImage(req.file.filename);

  const createdstudent = await Student.create({ ...req.body, imageUrl: image });

  // Send Response
  res.status(201).json({
    status: "Success",
    data: {
      createdstudent,
    },
  });
});

exports.updatestudent = catchAsync(async (req, res, next) => {
  const image = req.file && (await getImage(req.file.filename));
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { ...req.body, image },
    {
      new: true,
      runValidators: true,
    }
  );

  // if user does not exist send error
  if (!student) {
    return next(new AppError("no student found with that ID", 404));
  }

  // Send Response
  res.status(200).json({
    status: "success",
    data: {
      student,
    },
  });
});

exports.deleteStudent = catchAsync(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.params.id);

  if (!student) {
    return next(new AppError("no student found with that ID", 404));
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

//     try {

//         const file = await File.findOne({filename: fileName});
//         const id = file._id;
//         const chunks = await Chunk.find({ files_id: id });

//         if (!chunks || chunks.length === 0) {
//             console.log("No data found");
//         }

//         let fileData = [];
//         for (let i = 0; i < chunks.length; i++) {
//             fileData.push(chunks[i].data.toString('base64'));
//         }

//         //Display the chunks using the data URI format
//         return (finalFile = "data:" + file.contentType + ";base64;" + fileData.join(""));
//     } catch (error) {
//         return new AppError(error.message, error.statusCode)
//     }
// };
