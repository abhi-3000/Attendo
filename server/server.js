import adminRoutes from "./src/routes/adminRoutes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import facultyRoutes from "./src/routes/facultyRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";
import { startAttendanceCron } from "./src/jobs/attendanceCron.js";
dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); 
app.use(morgan("dev")); 

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);

app.get("/", (req, res) => {
  res.send("IIIT Ranchi Attendance API is running...");
});
startAttendanceCron();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
