import { beforeAll, describe, expect, it } from "bun:test";
import path from "node:path";

import {
    app,
    cleanupDatabase,
    createCategory,
    getAdminToken,
    loginAs,
    request,
    seedAdmin,
} from "./setup.ts";

beforeAll(async () => {
    await cleanupDatabase();
    await seedAdmin();
});

describe("Attachments", () => {
    let empToken: string;
    let mgrToken: string;
    let reimbursementId: string;

    beforeAll(async () => {
        const adminToken = await getAdminToken();

        await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                email: "att-emp@test.com",
                name: "Att Emp",
                password: "secret123",
                role: "EMPLOYEE",
            });
        await request(app)
            .post("/users")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                email: "att-mgr@test.com",
                name: "Att Mgr",
                password: "secret123",
                role: "MANAGER",
            });

        empToken = await loginAs("att-emp@test.com");
        mgrToken = await loginAs("att-mgr@test.com");

        const cat = await createCategory(adminToken, "Att-Cat");

        const res = await request(app)
            .post("/reimbursements")
            .set("Authorization", `Bearer ${empToken}`)
            .send({
                amount: 150,
                categoryId: cat.id,
                description: "With attachments",
                expenseDate: "2026-05-01T00:00:00Z",
            });
        reimbursementId = res.body.id;
    });

    it("POST /reimbursements/:id/attachments uploads a file (PDF)", async () => {
        const testFile = path.resolve(import.meta.dirname, "fixtures/sample.pdf");

        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${empToken}`)
            .attach("file", testFile);

        expect(res.status).toBe(201);
        expect(res.body.fileName).toBe("sample.pdf");
        expect(res.body.fileType).toBe("application/pdf");
        expect(res.body.fileUrl).toMatch(/^\/uploads\//);
    });

    it("POST /reimbursements/:id/attachments returns 400 for invalid file type", async () => {
        const testFile = path.resolve(import.meta.dirname, "fixtures/sample.txt");

        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${empToken}`)
            .attach("file", testFile);

        expect(res.status).toBe(400);
    });

    it("POST /reimbursements/:id/attachments returns 400 without file", async () => {
        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${empToken}`);

        expect(res.status).toBe(400);
    });

    it("POST /reimbursements/:id/attachments returns 403 for non-owner", async () => {
        const testFile = path.resolve(import.meta.dirname, "fixtures/sample.pdf");

        const res = await request(app)
            .post(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${mgrToken}`)
            .attach("file", testFile);

        expect(res.status).toBe(403);
    });

    it("GET /reimbursements/:id/attachments lists attachments for owner", async () => {
        const res = await request(app)
            .get(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${empToken}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it("GET /reimbursements/:id/attachments accessible by manager when SUBMITTED", async () => {
        await request(app)
            .post(`/reimbursements/${reimbursementId}/submit`)
            .set("Authorization", `Bearer ${empToken}`);

        const res = await request(app)
            .get(`/reimbursements/${reimbursementId}/attachments`)
            .set("Authorization", `Bearer ${mgrToken}`);

        expect(res.status).toBe(200);
    });

    it("GET /reimbursements/:id/attachments returns 403 for manager when DRAFT", async () => {
        const createRes = await request(app)
            .post("/reimbursements")
            .set("Authorization", `Bearer ${empToken}`)
            .send({
                amount: 50,
                categoryId: (
                    await createCategory(await getAdminToken(), "Att-Cat-2")
                ).id,
                description: "Draft attachments",
                expenseDate: "2026-05-01T00:00:00Z",
            });
        const draftId = createRes.body.id;

        const res = await request(app)
            .get(`/reimbursements/${draftId}/attachments`)
            .set("Authorization", `Bearer ${mgrToken}`);

        expect(res.status).toBe(403);
    });
});
