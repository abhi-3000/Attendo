import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// 1. Hash a password
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 2. Compare a password (for login)
export const comparePassword = async (rawPassword, hashedPassword) => {
  return await bcrypt.compare(rawPassword, hashedPassword);
};

// 3. Generate a Login Token (JWT)
export const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "7d", // Token lasts for 7 days
  });
};
