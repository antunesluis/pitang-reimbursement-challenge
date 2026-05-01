import { Router } from 'express';

export const reimbursementRoutes = Router();

// TODO: implement controller and auth
reimbursementRoutes.get('/', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.get('/:id', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.put('/:id', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/submit', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/approve', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/reject', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/pay', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/cancel', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.get('/:id/history', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.post('/:id/attachments', (_req, res) => {
    res.sendStatus(501);
});

reimbursementRoutes.get('/:id/attachments', (_req, res) => {
    res.sendStatus(501);
});
