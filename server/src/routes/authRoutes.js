import express from "express";
import { login, registerAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/register-admin", registerAdmin); // We will use this once to create the super admin

export default router;
