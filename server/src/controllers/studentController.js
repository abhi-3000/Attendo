import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get Student Dashboard Data (Courses & Attendance Stats)
// Get Student Dashboard Data
export const getStudentDashboard = async (req, res) => {
  const userId = req.user.userId;

  try {
    // 1. Find Student Profile AND fetch the User name
    const student = await prisma.student.findUnique({
      where: { userId },
      include: { 
        branch: true,
        user: { select: { name: true } } // <--- ADD THIS LINE
      }
    });

    if (!student) return res.status(404).json({ error: "Student profile not found" });

    // 2. Find All Courses
    const courses = await prisma.course.findMany({
      where: {
        branchId: student.branchId,
        semester: student.semester
      },
      include: {
        faculty: {
          include: { user: { select: { name: true } } }
        }
      }
    });

    // 3. Calculate Attendance
    const data = await Promise.all(courses.map(async (course) => {
      const totalClasses = await prisma.attendanceSession.count({
        where: { courseId: course.id }
      });

      const attendedClasses = await prisma.attendanceRecord.count({
        where: {
          studentId: student.id,
          session: { courseId: course.id },
          status: 'PRESENT'
        }
      });

      const percentage = totalClasses === 0 ? 0 : ((attendedClasses / totalClasses) * 100).toFixed(2);

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        faculty: course.faculty?.user?.name || "TBA",
        totalClasses,
        attendedClasses,
        percentage
      };
    }));

    res.json({
      studentName: student.user.name,
      program: student.program,
      branch: student.branch.code,
      semester: student.semester,
      courses: data
    });

  } catch (error) {
    console.error("Student Dashboard Error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};