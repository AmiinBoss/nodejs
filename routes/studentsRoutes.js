const express = require("express");
const studentController = require("./../controllers/studentsController");

const router = express.Router();

router
  .route("/")
  .get(studentController.getAllstudents)
  .post(studentController.uploadImage, studentController.createstudent);

router
  .route("/:id")
  .patch(studentController.uploadImage, studentController.updatestudent)
  .delete(studentController.deleteStudent);

module.exports = router;
