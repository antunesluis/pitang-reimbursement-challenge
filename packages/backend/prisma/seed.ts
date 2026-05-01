import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma.ts';

async function seed() {
    const email = process.env.ADMIN_EMAIL ?? 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD ?? 'admin123';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`Admin user already exists: ${email}`);
        await prisma.$disconnect();
        return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
        data: { email, name: 'Admin', password: hashedPassword, role: 'ADMIN' },
    });

    console.log(`Admin user created: ${email}`);
    await prisma.$disconnect();
}

seed();
