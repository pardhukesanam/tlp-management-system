import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.holiday.createMany({
    data: [
      {
        name: "Republic Day",
        holidayDate: new Date("2027-01-26"),
      },
      {
        name: "Independence Day",
        holidayDate: new Date("2027-08-15"),
      },
      {
        name: "Gandhi Jayanti",
        holidayDate: new Date("2027-10-02"),
      },
      {
        name: "Diwali",
        holidayDate: new Date("2027-11-05"),
      },
      {
        name: "Christmas",
        holidayDate: new Date("2027-12-25"),
      },
    ],
    skipDuplicates: true,
  });
  console.log("Holidays seeded successfully");
}
main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });