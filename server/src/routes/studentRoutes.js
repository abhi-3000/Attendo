import express from "express";
import { getStudentDashboard } from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { markGeofencedAttendance } from "../controllers/studentController.js";
const router = express.Router();

router.use(protect);

router.get("/dashboard", getStudentDashboard);
router.post("/mark-geofence", markGeofencedAttendance);
export default router;
