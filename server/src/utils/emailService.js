import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendWarningEmail = async (
  to,
  studentName,
  courseName,
  percentage,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: `URGENT: Attendance Warning for ${courseName}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #d9534f;">Attendance Alert</h2>
        <p>Dear ${studentName},</p>
        <p>Your attendance for <strong>${courseName}</strong> has dropped to <strong>${percentage}%</strong>.</p>
        <p>This is below the mandatory 75% requirement. Please ensure you attend the upcoming classes to avoid detention.</p>
        <br/>
        <p>Regards,<br/>IIIT Ranchi Administration</p>
      </div>
    `,
  };
  await transporter.sendMail(mailOptions);
};
