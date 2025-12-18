import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { getAssignedCourses, getCourseStudents, markAttendance, exportAttendanceExcel } from '../controllers/facultyController.js';

const router = express.Router();

// All routes require login
router.use(protect);

router.get("/courses", getAssignedCourses);
router.get("/course/:courseId/students", getCourseStudents);
router.post("/attendance", markAttendance);
router.get("/attendance/:courseId/export", exportAttendanceExcel);

export default router;
