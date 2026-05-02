import { beforeAll, describe, expect, it } from 'bun:test';

import {
    app,
    cleanupDatabase,
    createCategory,
    getAdminToken,
    loginAs,
    request,
    seedAdmin,
} from './setup.ts';

beforeAll(async () => {
    await cleanupDatabase();
    await seedAdmin();
});

describe('Categories', () => {
    let adminToken: string;

    beforeAll(async () => {
        adminToken = await getAdminToken();
    });

    it('GET /categories returns 401 without auth', async () => {
        const res = await request(app).get('/categories');
        expect(res.status).toBe(401);
    });

    it('POST /categories creates category as ADMIN', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Transporte' });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe('Transporte');
        expect(res.body.active).toBe(true);
    });

    it('POST /categories returns 403 for EMPLOYEE', async () => {
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'cat-emp@test.com',
                name: 'Cat Emp',
                password: 'secret123',
                role: 'EMPLOYEE',
            });

        const empToken = await loginAs('cat-emp@test.com');

        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${empToken}`)
            .send({ name: 'Hacked' });

        expect(res.status).toBe(403);
    });

    it('GET /categories lists all categories for authenticated user', async () => {
        const empToken = await loginAs('cat-emp@test.com');

        const res = await request(app)
            .get('/categories')
            .set('Authorization', `Bearer ${empToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('POST /categories returns 409 for duplicate name', async () => {
        const res = await request(app)
            .post('/categories')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ name: 'Transporte' });

        expect(res.status).toBe(409);
    });

    it('PUT /categories/:id updates category as ADMIN', async () => {
        const cat = await createCategory(adminToken, 'Alimentação');

        const res = await request(app)
            .put(`/categories/${cat.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ active: false, name: 'Alimentação Atualizada' });

        expect(res.status).toBe(200);
        expect(res.body.name).toBe('Alimentação Atualizada');
        expect(res.body.active).toBe(false);
    });
});
