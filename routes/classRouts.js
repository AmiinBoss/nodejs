const express = require("express");
const classController = require("../controllers/classController");

const router = express.Router();

router
  .route("/")
  .get(classController.getAllClasses)
  .post(classController.createClass);

router
  .route("/:id")
  .get(classController.getClass)
  .patch(classController.updateClass)
  .delete(classController.deleteClass);
// router
//   .route("/:classId/subjects/:subjectCode/teacher")
//   .patch(classController.updateSubjectTeacher);
router
  .route("/:classId/subjects")
  .get(classController.getClassSubjects)
  .patch(classController.updateClassSubjects);
router
  .route("/:classId/students")
  .get(classController.getClassStudents)
  .patch(classController.updateClassStudents);
router
  .route("/:classId/subjects/:subjectCode")
  .patch(classController.updateSubject)
  .get(classController.getSubject);

module.exports = router;
