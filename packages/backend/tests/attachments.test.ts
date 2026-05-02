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

describe('Attachments', () => {
    let empToken: string;
    let mgrToken: string;
    let reimbursementId: string;

    beforeAll(async () => {
        const adminToken = await getAdminToken();

        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'att-emp@test.com',
                name: 'Att Emp',
                password: 'secret123',
                role: 'EMPLOYEE',
            });
        await request(app)
            .post('/users')
            .set('Authorization', `Bearer ${adminToken}`)
            .send({
                email: 'att-mgr@test.com',
                name: 'Att Mgr',
                password: 'secret123',
                role: 'MANAGER',
            });

        empToken = await loginAs('att-emp@test.com');
        mgrToken = await loginAs('att-mgr@test.com');

        const cat = await createCategory(adminToken, 'Att-Cat');

        const res = await request(app)
            .post('/reimbursements')
            .set('Authorization', `Bearer ${empToken}`)
            .send({
                amount: 150,
                categoryId: cat.id,
                description: 'With attachments',
                expenseDate: '2026-05-01T00:00:00Z',
            });
        reimbursementId = res.body.id;
    });

    it('POST /reimbursements/:id/attachments uploads attachment (PDF)', async () => {
        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set('Authorization', `Bearer ${empToken}`)
            .send({
                fileName: 'receipt.pdf',
                fileType: 'application/pdf',
                fileUrl: 'https://example.com/receipt.pdf',
            });

        expect(res.status).toBe(201);
        expect(res.body.fileName).toBe('receipt.pdf');
    });

    it('POST /reimbursements/:id/attachments returns 400 for invalid file type', async () => {
        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set('Authorization', `Bearer ${empToken}`)
            .send({
                fileName: 'virus.exe',
                fileType: 'application/x-msdos-program',
                fileUrl: 'https://example.com/virus.exe',
            });

        expect(res.status).toBe(400);
    });

    it('POST /reimbursements/:id/attachments returns 403 for non-owner', async () => {
        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set('Authorization', `Bearer ${mgrToken}`)
            .send({
                fileName: 'invoice.png',
                fileType: 'image/png',
                fileUrl: 'https://example.com/invoice.png',
            });

        expect(res.status).toBe(403);
    });

    it('GET /reimbursements/:id/attachments lists attachments for owner', async () => {
        const res = await request(app)
            .get(`/reimbursements/${reimbursementId}/attachments`)
            .set('Authorization', `Bearer ${empToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('GET /reimbursements/:id/attachments accessible by manager', async () => {
        const res = await request(app)
            .get(`/reimbursements/${reimbursementId}/attachments`)
            .set('Authorization', `Bearer ${mgrToken}`);

        expect(res.status).toBe(200);
    });
});
