import cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { sendWarningEmail } from "../utils/emailService.js";

const prisma = new PrismaClient();

const checkAndSendWarnings = async () => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        sessions: true,
        enrollments: {
          include: {
            student: {
              include: { user: true },
            },
          },
        },
      },
    });

    for (const course of courses) {
      const totalSessions = course.sessions.length;
      if (totalSessions === 0) continue;

      for (const enrollment of course.enrollments) {
        const student = enrollment.student;

        const records = await prisma.attendanceRecord.findMany({
          where: {
            studentId: student.id,
            sessionId: { in: course.sessions.map((s) => s.id) },
          },
        });

        const presentCount = records.filter(
          (r) => r.status === "PRESENT",
        ).length;
        const percentage = ((presentCount / totalSessions) * 100).toFixed(2);

        if (percentage < 75) {
          await sendWarningEmail(
            student.user.email,
            student.user.name,
            course.name,
            percentage,
          );
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const startAttendanceCron = () => {
  cron.schedule("0 18 * * 5", checkAndSendWarnings);
};
