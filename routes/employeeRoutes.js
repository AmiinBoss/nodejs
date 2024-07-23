const express = require('express');
const employeeController = require('./../controllers/employeeController');

const router = express.Router();


router
    .route('/')
    .get(employeeController.getAllEmployees)
    .post(employeeController.uploadImage, employeeController.createEmployee);

router
    .route('/:id')
    .patch(employeeController.uploadImage, employeeController.updateEmployee)
    .delete(employeeController.deleteEmployee);


module.exports = router;
