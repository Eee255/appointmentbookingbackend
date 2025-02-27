const express = require("express");
const cors = require("cors");
const connectionDB = require("./config/database");
const doctorRoutes = require("./routes/doctorRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "https://appointmentbookingweb.vercel.app",
    credentials: true,
  })
);

app.use("/api", doctorRoutes);
app.use("/api", appointmentRoutes);

connectionDB()
  .then(() => {
    console.log("Database connected successfully...");
    app.listen(5000, () => {
      console.log(`Server is running on port 5000`);
    });
  })
  .catch(() => {
    console.error("Database connection failed! Server not started.");
  });
