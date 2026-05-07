import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../utils/authUtils.js";

const prisma = new PrismaClient();

// 1. Create a New Faculty
export const createFaculty = async (req, res) => {
  try {
    const { name, email, password, designation, department } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Transaction: Create User AND Faculty Profile together
    const newFaculty = await prisma.$transaction(async (prisma) => {
      // A. Create User Login
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "FACULTY",
        },
      });

      // B. Create Faculty Profile
      const facultyProfile = await prisma.faculty.create({
        data: {
          userId: user.id,
          designation, // e.g., "Assistant Professor"
          department, // e.g., "CSE"
        },
      });

      return { user, facultyProfile };
    });

    res
      .status(201)
      .json({ message: "Faculty created successfully", data: newFaculty });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create faculty" });
  }
};

// 2. Get All Faculty
export const getAllFaculty = async (req, res) => {
  try {
    const facultyList = await prisma.faculty.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true }, // Only get safe data
        },
      },
    });
    res.json(facultyList);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch faculty list" });
  }
};

export const getAllBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

export const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNumber,
      batch,
      branchId,
      program,
      semester,
    } = req.body;

  
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });

    const existingRoll = await prisma.student.findUnique({
      where: { rollNumber },
    });
    if (existingRoll)
      return res.status(400).json({ error: "Roll Number already exists" });

    const hashedPassword = await hashPassword(password);

    const newStudent = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "STUDENT" },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber,
          batch, 
          branchId,
          program, 
          semester: parseInt(semester),
        },
      });
      return { user, student };
    });

    res
      .status(201)
      .json({ message: "Student created successfully", data: newStudent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create student" });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: true,
      },
      orderBy: { rollNumber: "asc" },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};
export const createCourse = async (req, res) => {
  try {
    const { code, name, semester, credits, branchId, facultyId } = req.body;
    const existingCourse = await prisma.course.findUnique({ where: { code } });
    if (existingCourse)
      return res.status(400).json({ error: "Course code already exists" });

    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        semester: parseInt(semester),
        credits: parseInt(credits),
        branchId,
        facultyId: facultyId || null,
      },
    });

    res
      .status(201)
      .json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        branch: true,
        faculty: {
          include: { user: { select: { name: true } } },
        },
      },
      orderBy: { code: "asc" }, 
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const activeCourses = await prisma.course.count();
    const totalRecords = await prisma.attendanceRecord.count();
    const presentRecords = await prisma.attendanceRecord.count({
      where: { status: "PRESENT" },
    });
    const avgAttendance =
      totalRecords > 0 ? ((presentRecords / totalRecords) * 100).toFixed(1) : 0;

    const recentStudents = await prisma.student.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const recentFaculty = await prisma.faculty.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    });

    const recentCourses = await prisma.course.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      select: { name: true, code: true, createdAt: true },
    });

    const activities = [
      ...recentStudents.map((s) => ({
        id: s.id,
        text: `New student registered: ${s.user.name}`,
        time: s.createdAt,
        type: "student",
      })),
      ...recentFaculty.map((f) => ({
        id: f.id,
        text: `New faculty joined: ${f.user.name}`,
        time: f.createdAt,
        type: "faculty",
      })),
      ...recentCourses.map((c) => ({
        id: c.id || Math.random(), 
        text: `New course added: ${c.name} (${c.code})`,
        time: c.createdAt,
        type: "course",
      })),
    ];

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivity = activities.slice(0, 5);

    res.json({
      totalStudents,
      totalFaculty,
      activeCourses,
      avgAttendance,
      recentActivity,
    });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};

export const addBulkStudents = async (req, res) => {
  try {
    const { students } = req.body;
    console.log(
      ` Received request to bulk add ${students?.length} students.`,
    );

    if (!students || students.length === 0) {
      return res
        .status(400)
        .json({ error: "No students provided in the file." });
    }
    const branches = await prisma.branch.findMany();
    const branchMap = {};
    branches.forEach((b) => {
      branchMap[b.code.toUpperCase()] = b.id;
    });


    const incomingEmails = students.map((s) => s.email);
    const incomingRolls = students.map((s) => s.rollNumber);

    const existingUsers = await prisma.user.findMany({
      where: { email: { in: incomingEmails } },
      select: { email: true },
    });
    if (existingUsers.length > 0) {
      const duplicates = existingUsers.map((u) => u.email).join(", ");
      return res
        .status(400)
        .json({
          error: `Upload aborted. These emails already exist: ${duplicates}`,
        });
    }

    const existingStudents = await prisma.student.findMany({
      where: { rollNumber: { in: incomingRolls } },
      select: { rollNumber: true },
    });
    if (existingStudents.length > 0) {
      const duplicates = existingStudents.map((s) => s.rollNumber).join(", ");
      return res
        .status(400)
        .json({
          error: `Upload aborted. These Roll Numbers already exist: ${duplicates}`,
        });
    }
    console.log("➡️ Hashing passwords...");
    const processedStudents = await Promise.all(
      students.map(async (s) => {
        const hashedPassword = await hashPassword(s.password || "password123");
        return { ...s, hashedPassword };
      }),
    );

    console.log("➡️ Building transaction operations...");
    const operations = processedStudents.map((s) => {
      const branchId = branchMap[s.branchCode?.toUpperCase()];
      if (!branchId)
        throw new Error(
          `Invalid branch code '${s.branchCode}' found for ${s.name}`,
        );

      return prisma.user.create({
        data: {
          name: s.name,
          email: s.email,
          password: s.hashedPassword,
          role: "STUDENT",
          student: {
            create: {
              rollNumber: s.rollNumber,
              batch: s.batch,
              branchId: branchId,
              program: s.program?.toUpperCase() || "BTECH",
              semester: parseInt(s.semester) || 1,
            },
          },
        },
      });
    });
    console.log("Executing bulk transaction...");
    const results = await prisma.$transaction(operations);

    console.log(`Successfully added ${results.length} students.`);
    res
      .status(201)
      .json({ message: `${results.length} students added successfully.` });
  } catch (error) {
    console.error("Bulk Upload Error:", error);
    res
      .status(400)
      .json({ error: error.message || "Failed to process bulk upload." });
  }
};

export const getAdvancedAnalytics = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany({
      include: {
        students: {
          include: {
            attendance: true,
          },
        },
      },
    });

    const branchStats = branches.map((branch) => {
      let totalPresent = 0;
      let totalRecords = 0;
      branch.students.forEach((student) => {
        student.attendance.forEach((record) => {
          totalRecords++;
          if (record.status === "PRESENT") totalPresent++;
        });
      });
      const percentage =
        totalRecords === 0 ? 0 : (totalPresent / totalRecords) * 100;
      return {
        name: branch.code,
        percentage: parseFloat(percentage.toFixed(2)),
      };
    });

    const recentSessions = await prisma.attendanceSession.findMany({
      take: 7,
      orderBy: { date: "desc" },
      include: {
        records: true,
      },
    });

    const trendData = recentSessions
      .map((session) => {
        const present = session.records.filter(
          (r) => r.status === "PRESENT",
        ).length;
        const absent = session.records.filter(
          (r) => r.status === "ABSENT",
        ).length;
        return {
          date: session.date.toISOString().split("T")[0],
          present,
          absent,
        };
      })
      .reverse();

    res.status(200).json({ branchStats, trendData });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};