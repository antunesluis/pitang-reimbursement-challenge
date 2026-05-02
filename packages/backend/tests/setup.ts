import 'dotenv/config';

import request from 'supertest';

import { app } from '../src/app.ts';
import { prisma } from '../src/lib/prisma.ts';

export { app, prisma, request };

export async function cleanupDatabase() {
    await prisma.history.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.reimbursement.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
}

export async function seedAdmin() {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin',
            password: hashedPassword,
            role: 'ADMIN',
        },
    });
}

export async function getAdminToken() {
    const res = await request(app)
        .post('/auth/login')
        .send({ email: 'admin@example.com', password: 'admin123' });
    return res.body.token as string;
}

export async function loginAs(email: string, password = 'secret123') {
    const res = await request(app)
        .post('/auth/login')
        .send({ email, password });
    return res.body.token as string;
}

export async function createCategory(adminToken: string, name: string) {
    const res = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name });
    if (res.status === 409) {
        // Category already exists, fetch by listing
        const listRes = await request(app)
            .get('/categories')
            .set('Authorization', `Bearer ${adminToken}`);
        const found = (listRes.body as { id: string; name: string }[]).find(
            (c) => c.name === name,
        );
        if (!found)
            throw new Error(`Category "${name}" not found after 409 response`);
        return found;
    }
    return res.body as {
        active: boolean;
        createdAt: string;
        id: string;
        name: string;
        updatedAt: string;
    };
}
