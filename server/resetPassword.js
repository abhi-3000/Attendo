import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function resetPassword() {
  const email = "admin@iiitranchi.ac.in";
  const newPassword = "admin123";

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  try {
    const user = await prisma.user.update({
      where: { email: email },
      data: { password: hashedPassword },
    });
    console.log(`Password reset successfully for ${user.email}`);
  } catch (error) {
    console.log("Error resetting password. Check if the email is correct.");
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
