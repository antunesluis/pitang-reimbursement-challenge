import { beforeAll, describe, expect, it } from 'bun:test';

import {
    app,
    cleanupDatabase,
    getAdminToken,
    loginAs,
    request,
    seedAdmin,
} from './setup.ts';

beforeAll(async () => {
    await cleanupDatabase();
    await seedAdmin();
});

describe('Users', () => {
    let adminToken: string;

    beforeAll(async () => {
        adminToken = await getAdminToken();
    });

    it('POST /users creates user when ADMIN', async () => {
        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'new@test.com',
                name: 'New User',
                password: 'secret123',
                role: 'EMPLOYEE',
            });

        expect(res.status).toBe(201);
        expect(res.body.email).toBe('new@test.com');
        expect(res.body.role).toBe('EMPLOYEE');
        expect(res.body).not.toHaveProperty('password');
    });

    it('POST /users returns 401 without auth', async () => {
        const res = await request(app)
            .post('/users')
            .send({ email: 'x@x.com', name: 'X', password: 'secret123' });

        expect(res.status).toBe(401);
    });

    it('POST /users returns 403 for non-ADMIN', async () => {
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'emp@test.com',
                name: 'Emp',
                password: 'secret123',
                role: 'EMPLOYEE',
            });

        const empToken = await loginAs('emp@test.com');

        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${empToken}`)
            .send({ email: 'x@x.com', name: 'X', password: 'secret123' });

        expect(res.status).toBe(403);
    });

    it('POST /users returns 409 for duplicate email', async () => {
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'dup@test.com',
                name: 'Dup',
                password: 'secret123',
            });

        const res = await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'dup@test.com',
                name: 'Duplicate',
                password: 'secret123',
            });

        expect(res.status).toBe(409);
    });

    it('GET /users lists all users for ADMIN', async () => {
        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /users returns 403 for EMPLOYEE', async () => {
        const empToken = await loginAs('emp@test.com');

        const res = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${empToken}`);

        expect(res.status).toBe(403);
    });
});
