const mongoose = require("mongoose");
const Doctor = require("../models/doctor");
const Appointment = require("../models/appointment");

const CreateDoctorDetails = async (req, res) => {
  try {
    const { name, workingHours, specialization } = req.body;

    if (!name || !workingHours) {
      return res
        .status(400)
        .json({ message: "Name and working hours are required" });
    }

    const newDoctor = new Doctor({
      name,
      workingHours,
      specialization,
    });

    const savedDoctor = await newDoctor.save();
    res.status(201).json(savedDoctor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const doctorDetails = async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const doctorTimings = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const date = req.query.date; 

    if (!date) {
      return res
        .status(400)
        .json({ error: "Date is required in YYYY-MM-DD format." });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }

    const { start, end } = doctor.workingHours;
    const slotDuration = 30; 

    const localStartTime = new Date(`${date}T${start}:00.000`);
    const localEndTime = new Date(`${date}T${end}:00.000`);

    const availableSlots = [];
    let currentTime = new Date(localStartTime);

    while (currentTime < localEndTime) {
      availableSlots.push(currentTime.toTimeString().slice(0, 5));
      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    const doctorObjectId = new mongoose.Types.ObjectId(doctorId);
    

    const appointments = await Appointment.find({
      doctorId: doctorObjectId,
      $expr: {
        $regexMatch: {
          input: { $dateToString: { format: "%Y-%m-%d", date: "$date" } }, 
          regex: date, 
          options: "i", 
        }
      }
    });

    const bookedTimes = appointments.map(appointment => {
      return appointment.date.toISOString().split("T")[1].substring(0, 5); 
    });
    
    
    const freeSlots = availableSlots.filter(
      (slot) => !bookedTimes.includes(slot)
    );

    res.json({ availableSlots: freeSlots, totalSlots: availableSlots });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  CreateDoctorDetails,
  doctorDetails,
  doctorTimings,
};
