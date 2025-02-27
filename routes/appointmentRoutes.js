const express = require("express");
const {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");

const router = express.Router();

router.get("/appointments", getAllAppointments); 
router.get("/appointments/:id", getAppointmentById); 
router.post("/appointments", createAppointment); 
router.put("/appointments/:id", updateAppointment); 
router.delete("/appointments/:id", deleteAppointment);

module.exports = router;
