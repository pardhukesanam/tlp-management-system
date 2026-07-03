import { prisma } from "./prisma";

export const getWorkingDaysInMonth = async (
  month: number,
  year: number
) => {

  const holidays =
    await prisma.holiday.findMany();

  const holidaySet =
    new Set(
      holidays.map(
        (holiday) =>
          holiday.holidayDate
            .toISOString()
            .split("T")[0]
      )
    );
  let workingDays = 0;
  const daysInMonth =
    new Date(
      year,
      month,
      0
    ).getDate();
  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    const date =
      new Date(
        year,
        month - 1,
        day
      );
    const weekDay =
      date.getDay();
    const dateString =
      date
        .toISOString()
        .split("T")[0];
    const isWeekend =
      weekDay === 0 ||
      weekDay === 6;
    const isHoliday =
      holidaySet.has(
        dateString
      );
    if (
      !isWeekend &&
      !isHoliday
    ) {
      workingDays++;
    }
  }
  return workingDays;
};