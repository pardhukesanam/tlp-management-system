import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function savePayslipPdf(
  payroll: any
): Promise<string> {

  const fileName =
    `${payroll.employee.employeeCode}-${payroll.payrollMonth}-${payroll.payrollYear}.pdf`;

  const filePath = path.join(
    process.cwd(),
    "uploads",
    "payslips",
    fileName
  );

  const doc = new PDFDocument();

  const stream =
    fs.createWriteStream(filePath);

  doc.pipe(stream);

  doc.fontSize(20);
  doc.text("Payslip");

  doc.end();

  return new Promise((resolve) => {

    stream.on("finish", () => {
      resolve(filePath);
    });

  });
}