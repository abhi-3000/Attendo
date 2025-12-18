import express from "express";
import {
  createFaculty,
  getAllFaculty,
  createStudent,
  getAllStudents,
  getAllBranches,
  createCourse,
  getAllCourses,
  getDashboardStats,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Applying protection to all routes in this file
router.use(protect, adminOnly);

router.post("/faculty", createFaculty);
router.get("/faculty", getAllFaculty);

router.get("/branches", getAllBranches);
router.post("/students", createStudent);
router.get("/students", getAllStudents);

router.post('/courses', createCourse);
router.get('/courses', getAllCourses);
router.get("/stats", getDashboardStats);

export default router;
