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
  addBulkStudents,
  getAdvancedAnalytics,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import { sendWarningEmail } from "../utils/emailService.js";

const router = express.Router();
router.use(protect, adminOnly);

router.post("/faculty", createFaculty);
router.get("/faculty", getAllFaculty);

router.get("/branches", getAllBranches);
router.post("/students", createStudent);
router.get("/students", getAllStudents);
router.post('/students/bulk', addBulkStudents);
router.post('/courses', createCourse);
router.get('/courses', getAllCourses);
router.get("/stats", getDashboardStats);
router.get("/analytics", getAdvancedAnalytics);

// test email cpde
router.get('/test-email', async (req, res) => {
  try {
    await sendWarningEmail(
      process.env.EMAIL_USER, 
      "Abhishek Mandal", 
      "Database Management Systems", 
      "64.2"
    );
    res.json({ message: "Demo email sent successfully! Check inbox." });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ error: "Failed to send email. Check backend terminal for details." });
  }
});

export default router;
