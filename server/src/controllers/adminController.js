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

// 3. Get All Branches (For Dropdowns)
export const getAllBranches = async (req, res) => {
  try {
    const branches = await prisma.branch.findMany();
    res.json(branches);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch branches" });
  }
};

// 4. Create Student
export const createStudent = async (req, res) => {
  try {
    const { name, email, password, rollNumber, batch, branchId, program, semester } = req.body;

    // Check existing
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    const existingRoll = await prisma.student.findUnique({ where: { rollNumber } });
    if (existingRoll) return res.status(400).json({ error: "Roll Number already exists" });

    const hashedPassword = await hashPassword(password);

    // Transaction
    const newStudent = await prisma.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "STUDENT" },
      });

      const student = await prisma.student.create({
        data: {
          userId: user.id,
          rollNumber,
          batch,       // e.g., "2022-2026"
          branchId,
          program,     // e.g., "BTECH"
          semester: parseInt(semester),
        },
      });
      return { user, student };
    });

    res.status(201).json({ message: "Student created successfully", data: newStudent });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create student" });
  }
};

// 5. Get All Students
export const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: true,
      },
      orderBy: { rollNumber: 'asc' }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// ... existing code ...

// 6. Create Course
export const createCourse = async (req, res) => {
  try {
    const { code, name, semester, credits, branchId, facultyId } = req.body;

    // Check if course code exists (e.g., CS101)
    const existingCourse = await prisma.course.findUnique({ where: { code } });
    if (existingCourse) return res.status(400).json({ error: "Course code already exists" });

    const newCourse = await prisma.course.create({
      data: {
        code,
        name,
        semester: parseInt(semester),
        credits: parseInt(credits),
        branchId,
        facultyId: facultyId || null, // Faculty is optional initially
      },
    });

    res.status(201).json({ message: "Course created successfully", data: newCourse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create course" });
  }
};

// 7. Get All Courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        branch: true,
        faculty: {
          include: { user: { select: { name: true } } }
        }
      },
      orderBy: { code: 'asc' } // Sort by CS101, CS102...
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// 8. Get Dashboard Stats
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Fetch Counts
    const totalStudents = await prisma.student.count();
    const totalFaculty = await prisma.faculty.count();
    const activeCourses = await prisma.course.count();

    // 2. Calculate Average Attendance (Institute Wide)
    const totalRecords = await prisma.attendanceRecord.count();
    const presentRecords = await prisma.attendanceRecord.count({ where: { status: 'PRESENT' } });
    const avgAttendance = totalRecords > 0 
      ? ((presentRecords / totalRecords) * 100).toFixed(1) 
      : 0;

    // 3. Fetch Recent Activity (Last 5 additions of any type)
    // We fetch top 3 from each category and merge them to find the true top 5
    const recentStudents = await prisma.student.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const recentFaculty = await prisma.faculty.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const recentCourses = await prisma.course.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { name: true, code: true, createdAt: true }
    });

    // Merge and Format
    const activities = [
      ...recentStudents.map(s => ({
        id: s.id,
        text: `New student registered: ${s.user.name}`,
        time: s.createdAt,
        type: 'student'
      })),
      ...recentFaculty.map(f => ({
        id: f.id,
        text: `New faculty joined: ${f.user.name}`,
        time: f.createdAt,
        type: 'faculty'
      })),
      ...recentCourses.map(c => ({
        id: c.id || Math.random(), // fallback if ID missing in select
        text: `New course added: ${c.name} (${c.code})`,
        time: c.createdAt,
        type: 'course'
      }))
    ];

    // Sort by most recent and take top 5
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivity = activities.slice(0, 5);

    res.json({
      totalStudents,
      totalFaculty,
      activeCourses,
      avgAttendance,
      recentActivity
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};