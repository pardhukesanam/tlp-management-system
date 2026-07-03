import PDFDocument from "pdfkit";
import path from "path";
import { Response } from "express";
import { toWords } from "number-to-words";

export async function generatePayslipPdf(
  payroll: any,
  earnings: any[],
  deductions: any[],
  res: Response
) {

  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
  });

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=payslip-${payroll.id}.pdf`
  );

  doc.pipe(res);

  const logoPath = path.join(
    process.cwd(),
    "assets",
    "dugong-logo.png"
  );

  const pageWidth =
    doc.page.width - 80;
  
  const offsetX = 40;

  const monthName =
    new Date(
      payroll.payrollYear,
      payroll.payrollMonth - 1
    ).toLocaleString(
      "default",
      {
        month: "long",
      }
    );

  const netSalary =
    Number(payroll.netSalary);

const paidDays =
  new Date(
    payroll.payrollYear,
    payroll.payrollMonth,
    0
  ).getDate() -
  Number(
    payroll.unpaidLeaveDays || 0
  );

  // LOGO

  try {

    doc.image(
      logoPath,
      45,
      55,
      {
        width: 80,
      }
    );

  } catch (error) {

    console.log(
      "Logo not found"
    );

  }

  // COMPANY NAME

  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text(
      "Dugong Global Services Pvt Ltd",
      145,
      60
    );

doc
  .fontSize(9)
  .font("Helvetica")
  .fillColor("#555555")
  .text(
    "1-179/27/P&26/P/NAVYA THE GRAND, Rameswaram Banda, Patancheru,",
    145,
    82
  );

doc.text(
  "Hyderabad - 502319 India",
  145,
  96
);

  doc
    .moveTo(40, 130)
    .lineTo(
      doc.page.width - 40,
      130
    )
    .strokeColor("#d9d9d9")
    .stroke();

  // PAYSLIP TITLE

doc
  .fillColor("#666666")
  .fontSize(11)
  .font("Helvetica")
  .text(
    "Payslip For the Month",
    470,
    55,
    {
      width: 110,
      align: "right",
    }
  );

doc
  .fillColor("black")
  .fontSize(14)
  .font("Helvetica-Bold")
  .text(
    `${monthName} ${payroll.payrollYear}`,
    470,
    75,
    {
      width: 110,
      align: "right",
    }
  );

  // EMPLOYEE SUMMARY

doc
  .fontSize(12)
  .font("Helvetica-Bold")
  .fillColor("#6b5d4d")
  .text(
    "EMPLOYEE SUMMARY",
    50,
    170
  );

doc
  .fillColor("black")
  .fontSize(11)
  .font("Helvetica");

const leftX = 50;
const colonX = 190;
const valueX = 210;

doc.text("Employee Name", leftX, 210);
doc.text(":", colonX, 210);
doc.text(
  `${payroll.employee.firstName} ${payroll.employee.lastName}`,
  valueX,
  210
);

doc.text("Employee ID", leftX, 245);
doc.text(":", colonX, 245);
doc.text(
  payroll.employee.employeeCode,
  valueX,
  245
);

doc.text("Pay Period", leftX, 280);
doc.text(":", colonX, 280);
doc.text(
  `${monthName} ${payroll.payrollYear}`,
  valueX,
  280
);

const payDate =
  payroll.paidAt
    ? new Date(payroll.paidAt)
    : new Date();

doc.text("Pay Date", leftX, 315);
doc.text(":", colonX, 315);
doc.text(
  payDate.toLocaleDateString("en-GB"),
  valueX,
  315
);

// NET PAY CARD

const cardX = 360;
const cardY = 160;
const cardWidth = 230;
const cardHeight = 200;

doc
  .roundedRect(
    cardX,
    cardY,
    cardWidth,
    cardHeight,
    10
  )
  .fillAndStroke(
    "#eef8ef",
    "#b7d8bc"
  );

// Green vertical line

doc
  .moveTo(cardX + 25, cardY + 25)
  .lineTo(cardX + 25, cardY + 80)
  .strokeColor("#4CAF50")
  .lineWidth(3)
  .stroke();

const formattedSalary =
  netSalary.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

doc
  .fillColor("black")
  .fontSize(20)
  .font("Helvetica-Bold")
  .text(
    `INR ${formattedSalary}`,
    cardX + 45,
    cardY + 35,
    {
      width: 160,
      align: "left",
    }
  );

doc
  .fillColor("#4d6f4d")
  .fontSize(11)
  .font("Helvetica")
  .text(
    "Employee Net Pay",
    cardX + 45,
    cardY + 82
  );

// Divider

doc
  .moveTo(cardX + 20, cardY + 125)
  .lineTo(
    cardX + cardWidth - 20,
    cardY + 125
  )
  .dash(2, { space: 2 })
  .strokeColor("#bbbbbb")
  .stroke();

doc.undash();

doc
  .fillColor("black")
  .fontSize(12);

doc.text(
  "Paid Days",
  cardX + 35,
  cardY + 150
);

doc.text(
  `: ${paidDays}`,
  cardX + 150,
  cardY + 150
);

doc.text(
  "LOP Days",
  cardX + 35,
  cardY + 180
);

doc.text(
  `: ${payroll.unpaidLeaveDays || 0}`,
  cardX + 150,
  cardY + 180
);

// EARNINGS & DEDUCTIONS TABLE
const tableTop = 380;

doc
  .fontSize(12)
  .font("Helvetica-Bold")
  .fillColor("black");

doc.text("EARNINGS", 50, tableTop);
doc.text("AMOUNT", 250, tableTop);

doc.text("DEDUCTIONS", 330, tableTop);
doc.text("AMOUNT", 500, tableTop);

// Header line

doc
  .moveTo(40, tableTop + 20)
  .lineTo(555, tableTop + 20)
  .strokeColor("#cccccc")
  .stroke();

const maxRows = Math.max(
  earnings.length,
  deductions.length
);

let currentY = tableTop + 35;

doc
  .fontSize(10)
  .font("Helvetica");

for (let i = 0; i < maxRows; i++) {

  const earning = earnings[i];

  const deduction = deductions[i];

  if (earning) {

    doc.text(
      earning.name,
      50,
      currentY
    );

    doc.text(
      Number(earning.amount).toLocaleString(
        "en-IN",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      ),
      250,
      currentY
    );

  }

  if (deduction) {

    doc.text(
      deduction.name,
      330,
      currentY
    );

    doc.text(
      Number(
        deduction.amount
      ).toLocaleString("en-IN"),
      500,
      currentY
    );

  }

  currentY += 20;
}

// Bottom line

doc
  .moveTo(40, currentY)
  .lineTo(555, currentY)
  .strokeColor("#cccccc")
  .stroke();

currentY += 8;

// TOTALS ROW
const grossEarnings =
  earnings.reduce(
    (sum, item) =>
      sum +
      Number(item.amount),
    0
  );

const totalDeductions =
  deductions.reduce(
    (sum, item) =>
      sum +
      Number(item.amount),
    0
  );

doc
  .fontSize(11)
  .font("Helvetica-Bold");

doc.text(
  "Gross Earnings",
  50,
  currentY
);

doc.text(
  grossEarnings.toLocaleString(
    "en-IN"
  ),
  250,
  currentY
);

doc.text(
  "Total Deductions",
  330,
  currentY
);

doc.text(
  totalDeductions.toLocaleString(
    "en-IN"
  ),
  500,
  currentY
);

currentY += 20;

// TOTAL NET PAYABLE
doc
  .rect(
    40,
    currentY,
    515,
    40
  )
  .fillAndStroke(
    "#e8f5e9",
    "#81c784"
  );

doc
  .fillColor("black")
  .fontSize(12)
  .font("Helvetica-Bold");

doc.text(
  "TOTAL NET PAYABLE",
  55,
  currentY + 13
);

doc.text(
  `INR ${netSalary.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`,
  420,
  currentY + 13
);

currentY += 35;

// AMOUNT IN WORDS
doc
  .fontSize(11)
  .font("Helvetica-Bold")
  .text(
    "Amount In Words",
    40,
    currentY
  );

doc
  .fontSize(10)
  .font("Helvetica")
  .text(
    `Indian Rupee ${toWords(
      Math.round(netSalary)
    )} Only`,
    40,
    currentY + 20
  );

currentY += 40;

// FOOTER
doc
  .fontSize(9)
  .fillColor("#666666")
  .text(
    "This is a computer generated payslip and does not require signature.",
    40,
    currentY,
    {
      align: "center",
      width: 515,
    }
  );
doc.end();
}

