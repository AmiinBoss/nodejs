const express = require("express");
const dashboardController = require("./../controllers/dashboardController");

const router = express.Router();

router
  .route("/")
  // .get(dashboardController.defaultDashboard)
  .get(dashboardController.getDashboard)
  .post(dashboardController.createDashboard);
router.route("/:id").delete(dashboardController.deleteDashboard);
module.exports = router;
