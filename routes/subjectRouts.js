const express = require("express");
const subjectController = require("../controllers/subjectController");

const router = express.Router();

router
  .route("/")
  .get(subjectController.getAllsubjects)
  .post(subjectController.createsubject);

router
  .route("/:id")
  .patch(subjectController.updatesubject)
  .delete(subjectController.deletesubject);
module.exports = router;
