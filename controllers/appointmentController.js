const Appointment = require("../models/appointment");
const mongoose = require('mongoose');

// create
const createAppointment = async (req, res) => {
  try {
    const { doctorId, date, duration, appointmentType, patientName, notes } = req.body;

    if (!doctorId || !date || !duration || !appointmentType || !patientName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);

    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toISOString().split("T")[0];

    const appointments = await Appointment.find({
      doctorId: doctorObjectId,
      $expr: {
        $regexMatch: {
          input: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
          regex: formattedDate, 
          options: "i", 
        },
      },
    });

    const bookedTimes = appointments.map((appointment) =>
      appointment.date.toISOString().split("T")[1].substring(0, 5)
    );

    const requestedTime = new Date(date).toISOString().split("T")[1].substring(0, 5);

    if (bookedTimes.includes(requestedTime)) {
      return res.status(400).json({
        message: `The time slot ${requestedTime} is already booked. Please choose another time.`,
        bookedTimes,
      });
    }

    const newAppointment = new Appointment({
      doctorId: doctorObjectId,
      date: new Date(date),
      duration,
      appointmentType,
      patientName,
      notes,
    });

    const savedAppointment = await newAppointment.save();

    res.status(201).json({
      message: "Appointment successfully created",
      appointment: savedAppointment,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};
// get appointments 
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find().populate(
      "doctorId",
      "name specialization"
    );
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// get one appointment 
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate(
      "doctorId",
      "name specialization"
    );
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// update 
const updateAppointment = async (req, res) => {
  try {
    const { date, doctorId, duration, appointmentType, patientName, notes } = req.body;
    const appointmentId = req.params.id;

    // Validate required fields
    if (!date || !doctorId) {
      return res.status(400).json({ message: "Date and doctorId are required" });
    }

    const existingAppointment = await Appointment.findById(appointmentId);
    if (!existingAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const newAppointmentDate = new Date(date);
    const formattedDate = newAppointmentDate.toISOString().split("T")[0];

    

    // Check for conflicts (excluding current appointment)
    const conflictingAppointments = await Appointment.find({
      doctorId: doctorId, 
      _id: { $ne: appointmentId }, 
      $expr: {
        $regexMatch: {
          input: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          regex: formattedDate,
          options: "i",
        },
      },
    });

    // Extract booked time slots
    const bookedTimes = conflictingAppointments.map((appointment) =>
      appointment.date.toISOString().split("T")[1].substring(0, 5)
    );

    const requestedTime = newAppointmentDate.toISOString().split("T")[1].substring(0, 5);

    if (bookedTimes.includes(requestedTime)) {
      return res.status(400).json({
        message: `The time slot ${requestedTime} is already booked. Please choose another time.`,
        bookedTimes,
      });
    }

    // Update appointment with optional fields
    const updatedFields = {
      date: newAppointmentDate,
      doctorId, // Required
    };

    if (duration !== undefined) updatedFields.duration = duration;
    if (appointmentType !== undefined) updatedFields.appointmentType = appointmentType;
    if (patientName !== undefined) updatedFields.patientName = patientName;
    if (notes !== undefined) updatedFields.notes = notes;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updatedFields,
      { new: true }
    );

    res.status(200).json({
      message: "Appointment successfully updated",
      appointment: updatedAppointment,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Server error", details: error.message });
  }
};

//del
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
};
