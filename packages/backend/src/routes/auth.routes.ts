import { Router } from 'express';

export const authRoutes = Router();

// TODO: implement controller
authRoutes.post('/login', (_req, res) => {
    res.sendStatus(501);
});
