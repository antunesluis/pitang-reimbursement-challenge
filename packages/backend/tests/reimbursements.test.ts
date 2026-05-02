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

describe('Reimbursements', () => {
    let adminToken: string;
    let empToken: string;
    let mgrToken: string;
    let finToken: string;
    let activeCatId: string;
    let inactiveCatId: string;

    beforeAll(async () => {
        adminToken = await getAdminToken();

        // Create users
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'r-emp@test.com',
                name: 'R Emp',
                password: 'secret123',
                role: 'EMPLOYEE',
            });
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'r-mgr@test.com',
                name: 'R Mgr',
                password: 'secret123',
                role: 'MANAGER',
            });
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'r-fin@test.com',
                name: 'R Fin',
                password: 'secret123',
                role: 'FINANCE',
            });

        empToken = await loginAs('r-emp@test.com');
        mgrToken = await loginAs('r-mgr@test.com');
        finToken = await loginAs('r-fin@test.com');

        // Create active category
        activeCatId = (await createCategory(adminToken, 'Reemb-Cat')).id;

        // Create and deactivate a category
        const inactiveCat = await createCategory(adminToken, 'Reemb-Inativa');
        await request(app)
            .put(`/categories/${inactiveCat.id}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ active: false });
        inactiveCatId = inactiveCat.id;
    });

    it('POST /reimbursements creates DRAFT', async () => {
        const res = await request(app)
            .post('/reimbursements')
            .set('Authorization', `Bearer ${empToken}`)
            .send({
                amount: 100,
                categoryId: activeCatId,
                description: 'Lunch with client',
                expenseDate: '2026-04-25T12:00:00Z',
            });

        expect(res.status).toBe(201);
        expect(res.body.status).toBe('DRAFT');
        expect(res.body.amount).toBe(100);
        expect(res.body.requester.name).toBe('R Emp');
        expect(res.body.category.name).toBe('Reemb-Cat');
    });

    it('POST /reimbursements returns 400 for inactive category', async () => {
        const res = await request(app)
            .post('/reimbursements')
            .set('Authorization', `Bearer ${empToken}`)
            .send({
                amount: 50,
                categoryId: inactiveCatId,
                description: 'Test',
                expenseDate: '2026-01-01T00:00:00Z',
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Category not found or inactive');
    });

    it('POST /reimbursements returns 403 for MANAGER', async () => {
        const res = await request(app)
            .post('/reimbursements')
            .set('Authorization', `Bearer ${mgrToken}`)
            .send({
                amount: 50,
                categoryId: activeCatId,
                description: 'Test',
                expenseDate: '2026-01-01T00:00:00Z',
            });

        expect(res.status).toBe(403);
    });

    describe('full flow: DRAFT → SUBMITTED → APPROVED → PAID', () => {
        let id: string;

        beforeAll(async () => {
            // Create
            const createRes = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    amount: 200,
                    categoryId: activeCatId,
                    description: 'Conference ticket',
                    expenseDate: '2026-05-01T00:00:00Z',
                });
            id = createRes.body.id;

            // Update in DRAFT
            await request(app)
                .put(`/reimbursements/${id}`)
                .set('Authorization', `Bearer ${empToken}`)
                .send({ description: 'Conference ticket — updated' });

            // Submit
            await request(app)
                .post(`/reimbursements/${id}/submit`)
                .set('Authorization', `Bearer ${empToken}`);

            // Approve
            await request(app)
                .post(`/reimbursements/${id}/approve`)
                .set('Authorization', `Bearer ${mgrToken}`);

            // Pay
            await request(app)
                .post(`/reimbursements/${id}/pay`)
                .set('Authorization', `Bearer ${finToken}`);
        });

        it('cannot edit after submit', async () => {
            const res = await request(app)
                .put(`/reimbursements/${id}`)
                .set('Authorization', `Bearer ${empToken}`)
                .send({ description: 'Hacked' });

            expect(res.status).toBe(400);
        });

        it('cannot pay twice', async () => {
            const res = await request(app)
                .post(`/reimbursements/${id}/pay`)
                .set('Authorization', `Bearer ${finToken}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Invalid status transition');
        });

        it('history has 5 entries', async () => {
            const res = await request(app)
                .get(`/reimbursements/${id}/history`)
                .set('Authorization', `Bearer ${empToken}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(5);

            const actions = res.body.map((h: { action: string }) => h.action);
            expect(actions).toContain('CREATED');
            expect(actions).toContain('UPDATED');
            expect(actions).toContain('SUBMITTED');
            expect(actions).toContain('APPROVED');
            expect(actions).toContain('PAID');
        });
    });

    describe('reject flow', () => {
        it('DRAFT → SUBMITTED → REJECTED with justification', async () => {
            const createRes = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    amount: 50,
                    categoryId: activeCatId,
                    description: 'Taxi',
                    expenseDate: '2026-04-01T00:00:00Z',
                });
            const id = createRes.body.id;

            await request(app)
                .post(`/reimbursements/${id}/submit`)
                .set('Authorization', `Bearer ${empToken}`);

            const rejectRes = await request(app)
                .post(`/reimbursements/${id}/reject`)
                .set('Authorization', `Bearer ${mgrToken}`)
                .send({ rejectionReason: 'Value not allowed' });

            expect(rejectRes.status).toBe(200);
            expect(rejectRes.body.status).toBe('REJECTED');
            expect(rejectRes.body.rejectionReason).toBe('Value not allowed');
        });
    });

    describe('cancel flow', () => {
        it('DRAFT → CANCELLED', async () => {
            const createRes = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    amount: 75,
                    categoryId: activeCatId,
                    description: 'Office supplies',
                    expenseDate: '2026-03-15T00:00:00Z',
                });
            const id = createRes.body.id;

            const cancelRes = await request(app)
                .post(`/reimbursements/${id}/cancel`)
                .set('Authorization', `Bearer ${empToken}`);

            expect(cancelRes.status).toBe(200);
            expect(cancelRes.body.status).toBe('CANCELLED');

            // Cannot submit a cancelled reimbursement
            const failRes = await request(app)
                .post(`/reimbursements/${id}/submit`)
                .set('Authorization', `Bearer ${empToken}`);
            expect(failRes.status).toBe(400);
        });
    });

    describe('list filtering', () => {
        it('EMPLOYEE sees only own reimbursements', async () => {
            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`);

            expect(res.status).toBe(200);
            for (const r of res.body) {
                expect(r.requester.email).toBe('r-emp@test.com');
            }
        });

        it('MANAGER sees only SUBMITTED', async () => {
            // Create and submit a fresh one for manager to see
            const createRes = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    amount: 30,
                    categoryId: activeCatId,
                    description: 'Fresh submit',
                    expenseDate: '2026-05-01T00:00:00Z',
                });

            await request(app)
                .post(`/reimbursements/${createRes.body.id}/submit`)
                .set('Authorization', `Bearer ${empToken}`);

            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${mgrToken}`);

            expect(res.status).toBe(200);
            for (const r of res.body) {
                expect(r.status).toBe('SUBMITTED');
            }
        });

        it('FINANCE sees only APPROVED', async () => {
            // Create and approve a dedicated reimbursement for this test
            const createRes = await request(app)
                .post('/reimbursements')
                .set('Authorization', `Bearer ${empToken}`)
                .send({
                    amount: 50,
                    categoryId: activeCatId,
                    description: 'For finance list',
                    expenseDate: '2026-05-01T00:00:00Z',
                });

            await request(app)
                .post(`/reimbursements/${createRes.body.id}/submit`)
                .set('Authorization', `Bearer ${empToken}`);

            await request(app)
                .post(`/reimbursements/${createRes.body.id}/approve`)
                .set('Authorization', `Bearer ${mgrToken}`);

            const res = await request(app)
                .get('/reimbursements')
                .set('Authorization', `Bearer ${finToken}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBeGreaterThanOrEqual(1);
            for (const r of res.body) {
                expect(r.status).toBe('APPROVED');
            }
        });
    });

    it('GET /reimbursements/:id returns 404 for nonexistent', async () => {
        const res = await request(app)
            .get('/reimbursements/nonexistent')
            .set('Authorization', `Bearer ${empToken}`);

        expect(res.status).toBe(404);
    });
});
