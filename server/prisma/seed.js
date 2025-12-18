import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // 1. Create Super Admin
  const adminEmail = "admin@iiitranchi.ac.in";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("✅ Super Admin created");
  }

  // 2. Seed IIIT Ranchi Branches
  const branches = [
    { name: "Computer Science & Engineering", code: "CSE" },
    { name: "CSE (Data Science & AI)", code: "CSE-DSAI" },
    { name: "Electronics & Communication", code: "ECE" },
    { name: "ECE (Embedded Systems & IoT)", code: "ECE-ES&IOT" },
  ];

  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: {}, // If it exists, do nothing
      create: branch, // If not, create it
    });
  }
  console.log("✅ Branches seeded: CSE, CSE-DSAI, ECE, ECE-ES&IOT");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// import { PrismaClient } from "@prisma/client";
// import bcrypt from "bcrypt";

// const prisma = new PrismaClient();

// async function main() {
//   // 1. Create Super Admin
//   const adminEmail = "admin@iiitranchi.ac.in";
//   const existingAdmin = await prisma.user.findUnique({
//     where: { email: adminEmail },
//   });

//   if (!existingAdmin) {
//     const hashedPassword = await bcrypt.hash("admin123", 10);

//     await prisma.user.create({
//       data: {
//         name: "Super Admin",
//         email: adminEmail,
//         password: hashedPassword,
//         role: "ADMIN",
//       },
//     });
//     console.log("✅ Super Admin created: admin@iiitranchi.ac.in / admin123");
//   } else {
//     console.log("ℹ️ Admin already exists.");
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
