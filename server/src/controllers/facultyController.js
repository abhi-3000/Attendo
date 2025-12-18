import { PrismaClient } from "@prisma/client";
import ExcelJS from "exceljs";
const prisma = new PrismaClient();

// 1. Get Courses Assigned to Logged-in Faculty
export const getAssignedCourses = async (req, res) => {
  const userId = req.user.userId; // From JWT

  try {
    // First find the faculty profile ID using the User ID
    const faculty = await prisma.faculty.findUnique({ where: { userId } });
    if (!faculty)
      return res.status(404).json({ error: "Faculty profile not found" });

    // Fetch courses linked to this faculty
    const courses = await prisma.course.findMany({
      where: { facultyId: faculty.id },
      include: {
        branch: true,
        // We keep this structure for frontend compatibility,
        // even if it returns 0 for now (since we aren't using manual enrollments)
        _count: { select: { enrollments: true } },
      },
    });

    res.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

// 2. Get Students (Smart Logic: Matches Branch & Semester automatically)
export const getCourseStudents = async (req, res) => {
  const { courseId } = req.params;
  const { date } = req.query; // Format: YYYY-MM-DD

  try {
    // A. Fetch Course details first to identify Branch & Semester
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return res.status(404).json({ error: "Course not found" });

    // B. Fetch Students matching that Branch and Semester
    // AND fetch their attendance status for the specific date if it exists
    const students = await prisma.student.findMany({
      where: {
        branchId: course.branchId,
        semester: course.semester,
      },
      include: {
        user: { select: { name: true, email: true } },
        attendance: {
          where: {
            session: {
              courseId: courseId,
              date: new Date(date),
            },
          },
        },
      },
      orderBy: { rollNumber: "asc" },
    });

    // C. Format response for the frontend
    const formattedData = students.map((student) => ({
      id: student.id,
      name: student.user.name,
      rollNumber: student.rollNumber,
      // If a record exists for this date, use that status. Otherwise null.
      status:
        student.attendance.length > 0 ? student.attendance[0].status : null,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// 3. Mark Attendance (Bulk Upsert)
export const markAttendance = async (req, res) => {
  const { courseId, date, records } = req.body;
  // records format: [{ studentId: "...", status: "PRESENT" }, ...]

  try {
    // A. Create or Find Session for this Date + Course
    // We use upsert so we don't create duplicate sessions for the same day
    const session = await prisma.attendanceSession.upsert({
      where: {
        courseId_date: { courseId, date: new Date(date) },
      },
      update: {}, // If exists, do nothing
      create: {
        courseId,
        date: new Date(date),
      },
    });

    // B. Save Records using a Transaction
    // We map over every student record sent from frontend
    const operations = records.map((record) =>
      prisma.attendanceRecord.upsert({
        where: {
          sessionId_studentId: {
            sessionId: session.id,
            studentId: record.studentId,
          },
        },
        update: { status: record.status }, // Update status if changed
        create: {
          sessionId: session.id,
          studentId: record.studentId,
          status: record.status,
        },
      })
    );

    // Execute all updates in one go
    await prisma.$transaction(operations);

    res.json({ message: "Attendance saved successfully" });
  } catch (error) {
    console.error("Error marking attendance:", error);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

// 4. Export Attendance as Excel
export const exportAttendanceExcel = async (req, res) => {
  const { courseId } = req.params;

  try {
    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { branch: true } });
    if (!course) return res.status(404).json({ error: "Course not found" });

    // 1. Get all sessions for this course (ordered by date) to create columns
    const sessions = await prisma.attendanceSession.findMany({
      where: { courseId },
      orderBy: { date: 'asc' }
    });

    // 2. Get all students (Rows)
    // We fetch their attendance records only for this course's sessions
    const students = await prisma.student.findMany({
      where: { branchId: course.branchId, semester: course.semester },
      include: {
        user: true,
        attendance: {
          where: { session: { courseId } },
          include: { session: true }
        }
      },
      orderBy: { rollNumber: 'asc' }
    });

    // 3. Create Workbook & Sheet
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance Report');

    // 4. Define Columns
    const columns = [
      { header: 'Roll No', key: 'roll', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
    ];

    // Add a column for each Date found in the database
    sessions.forEach(session => {
      columns.push({ 
        header: session.date.toISOString().split('T')[0], // Shows YYYY-MM-DD
        key: session.id, // We use session ID as the key to map data later
        width: 12,
        style: { alignment: { horizontal: 'center' } }
      });
    });

    // Add Summary Columns
    columns.push(
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Present', key: 'present', width: 10 },
      { header: '%', key: 'percentage', width: 10 }
    );

    sheet.columns = columns;

    // 5. Add Data Rows
    students.forEach(student => {
      const rowData = {
        roll: student.rollNumber,
        name: student.user.name,
      };

      let presentCount = 0;

      // Fill Date Columns
      sessions.forEach(session => {
        // Find if this student has a record for this specific session ID
        const record = student.attendance.find(r => r.sessionId === session.id);
        
        if (record) {
          rowData[session.id] = record.status === 'PRESENT' ? 'P' : 'A';
          if (record.status === 'PRESENT') presentCount++;
        } else {
          rowData[session.id] = '-'; // No record found (maybe student joined late)
        }
      });

      // Calculate Stats
      const totalSessions = sessions.length;
      const percentage = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(2) : "0.00";

      rowData.total = totalSessions;
      rowData.present = presentCount;
      rowData.percentage = percentage + '%';

      const row = sheet.addRow(rowData);
      
      // Optional: Color code the P and A
      sessions.forEach(session => {
        const cell = row.getCell(session.id);
        if(cell.value === 'A') {
          cell.font = { color: { argb: 'FFFF0000' } }; // Red for Absent
        } else if (cell.value === 'P') {
          cell.font = { color: { argb: 'FF008000' } }; // Green for Present
        }
      });
    });

    // 6. Send File
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=Attendance_${course.code}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ error: "Failed to generate Excel" });
  }
};
