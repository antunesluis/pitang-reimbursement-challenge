import bcrypt from "bcryptjs";

import { prisma } from "../src/lib/prisma.ts";

const USERS = [
  { email: "admin@example.com", name: "Admin", password: "admin123", role: "ADMIN" },
  { email: "employee@test.com", name: "Employee", password: "secret123", role: "EMPLOYEE" },
  { email: "manager@test.com", name: "Manager", password: "secret123", role: "MANAGER" },
  { email: "finance@test.com", name: "Finance", password: "secret123", role: "FINANCE" },
] as const;

const CATEGORIES = ["Transporte", "Alimentação", "Material de Escritório"] as const;

async function seed() {
  // Create users
  for (const user of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      console.log(`User already exists: ${user.email} (${user.role})`);
      continue;
    }

    const hashedPassword = await bcrypt.hash(
      process.env[`${user.role.toUpperCase()}_PASSWORD`] ?? user.password,
      10,
    );

    await prisma.user.create({
      data: { email: user.email, name: user.name, password: hashedPassword, role: user.role },
    });

    console.log(`User created: ${user.email} (${user.role})`);
  }

  // Create categories
  for (const name of CATEGORIES) {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
      console.log(`Category already exists: ${name}`);
      continue;
    }
    await prisma.category.create({ data: { name } });
    console.log(`Category created: ${name}`);
  }

  // Create sample reimbursement (DRAFT)
  const employee = await prisma.user.findUnique({ where: { email: "employee@test.com" } });
  const category = await prisma.category.findFirst();
  if (employee && category) {
    const existing = await prisma.reimbursement.findFirst({
      where: { description: "Sample — Almoço com cliente" },
    });
    if (!existing) {
      const reimbursement = await prisma.reimbursement.create({
        data: {
          amount: 85.5,
          categoryId: category.id,
          description: "Sample — Almoço com cliente",
          expenseDate: new Date("2026-04-25T12:00:00Z"),
          requesterId: employee.id,
          status: "DRAFT",
        },
      });
      await prisma.history.create({
        data: {
          action: "CREATED",
          observation: "Sample reimbursement — created by seed",
          reimbursementId: reimbursement.id,
          userId: employee.id,
        },
      });
      console.log(`Sample reimbursement created: ${reimbursement.id}`);
    } else {
      console.log("Sample reimbursement already exists");
    }
  }

  await prisma.$disconnect();
}

seed();
