import adminRoutes from "./src/routes/adminRoutes.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./src/routes/authRoutes.js";
import facultyRoutes from "./src/routes/facultyRoutes.js";
import studentRoutes from "./src/routes/studentRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json()); // Allows server to read JSON data
app.use(morgan("dev")); // Logs requests to console

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/student", studentRoutes);

// Root Endpoint
app.get("/", (req, res) => {
  res.send("IIIT Ranchi Attendance API is running...");
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
