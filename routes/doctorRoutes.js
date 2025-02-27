const express = require("express");
const { doctorDetails, doctorTimings, CreateDoctorDetails } = require("../controllers/doctorController");

const router = express.Router();

router.post('/doctors', CreateDoctorDetails); 
router.get('/doctors', doctorDetails); 
router.get('/doctors/:id/slots', doctorTimings); 

module.exports = router;
