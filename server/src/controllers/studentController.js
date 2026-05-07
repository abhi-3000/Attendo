import { PrismaClient } from "@prisma/client";
import { calculateDistance } from "../utils/geoUtils.js";
const prisma = new PrismaClient();


export const getStudentDashboard = async (req, res) => {
  const userId = req.user.userId;

  try {
  
    const student = await prisma.student.findUnique({
      where: { userId },
      include: {
        branch: true,
        user: { select: { name: true } }, 
      },
    });

    if (!student)
      return res.status(404).json({ error: "Student profile not found" });

  
    const courses = await prisma.course.findMany({
      where: {
        branchId: student.branchId,
        semester: student.semester,
      },
      include: {
        faculty: {
          include: { user: { select: { name: true } } },
        },
      },
    });


    const data = await Promise.all(
      courses.map(async (course) => {
        const totalClasses = await prisma.attendanceSession.count({
          where: { courseId: course.id },
        });

        const attendedClasses = await prisma.attendanceRecord.count({
          where: {
            studentId: student.id,
            session: { courseId: course.id },
            status: "PRESENT",
          },
        });

        const percentage =
          totalClasses === 0
            ? 0
            : ((attendedClasses / totalClasses) * 100).toFixed(2);

        return {
          id: course.id,
          code: course.code,
          name: course.name,
          faculty: course.faculty?.user?.name || "TBA",
          totalClasses,
          attendedClasses,
          percentage,
        };
      }),
    );

    res.json({
      studentName: student.user.name,
      program: student.program,
      branch: student.branch.code,
      semester: student.semester,
      courses: data,
    });
  } catch (error) {
    console.error("Student Dashboard Error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};



export const markGeofencedAttendance = async (req, res) => {
  try {
    const { courseId, studentLat, studentLng, facultyLat, facultyLng } =
      req.body;
    const userId = req.user.id;

    const distance = calculateDistance(
      facultyLat,
      facultyLng,
      studentLat,
      studentLng,
    );

    if (distance > 50) {
      return res
        .status(400)
        .json({ error: "You are outside the 50 meter classroom radius." });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let session = await prisma.attendanceSession.findFirst({
      where: { courseId, date: { gte: today } },
    });

    if (!session) {
      session = await prisma.attendanceSession.create({
        data: { courseId, date: new Date() },
      });
    }

    const studentData = await prisma.student.findUnique({
      where: { userId: userId },
    });

    const existingRecord = await prisma.attendanceRecord.findFirst({
      where: { sessionId: session.id, studentId: studentData.id },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ error: "Your attendance is already marked for today." });
    }

    await prisma.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: studentData.id,
        status: "PRESENT",
      },
    });

    res
      .status(200)
      .json({ message: "Verified and marked present successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Server error during location verification." });
  }
};