import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: process.env.MAIL_SECURE === "true",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from: `"Dharitri HRMS" <${process.env.MAIL_USER}>`,
    to,
    subject,
    html,
  });
};