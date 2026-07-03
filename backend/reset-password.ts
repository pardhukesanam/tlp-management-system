import bcrypt from "bcrypt";
import { prisma } from "./src/utils/prisma";

async function main() {
  const hashedPassword =
    await bcrypt.hash(
      "Password@123",
      10
    );

  await prisma.user.update({
    where: {
      email: "john@company.com",
    },
    data: {
      passwordHash: hashedPassword,
    },
  });

  console.log(
    "Password reset successfully"
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });