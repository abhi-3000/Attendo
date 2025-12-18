import express from "express";
import { getStudentDashboard } from "../controllers/studentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect); 

router.get("/dashboard", getStudentDashboard);

export default router;
