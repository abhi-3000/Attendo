import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  comparePassword,
  generateToken,
} from "../utils/authUtils.js";
import { z } from "zod";

const prisma = new PrismaClient();

// Validator for Login Input
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// --- LOGIN LOGIC ---
export const login = async (req, res) => {
  try {
    // 1. Validate Input
    const { email, password } = loginSchema.parse(req.body);

    // 2. Find User
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // 3. Check Password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // 4. Generate Token
    const token = generateToken(user.id, user.role);

    // 5. Send Response
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Server Error" });
  }
};

// --- REGISTER ADMIN (One-time setup) ---
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ error: "User already exists" });

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create Admin
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
