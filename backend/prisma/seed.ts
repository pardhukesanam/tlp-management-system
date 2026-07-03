import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
    const adminExists = await prisma.user.findFirst({
        where: {
            role: "ADMIN",
        },
    });

    if (adminExists) {
        console.log("Admin already exists.");
        return;
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);

    await prisma.user.create({
        data: {
            username: "admin",
            email: "kasi.aurangabad@dharitri.org",
            passwordHash,
            role: "ADMIN",
            mustChangePassword: true,
        },
    });

    console.log("Default admin created.");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });