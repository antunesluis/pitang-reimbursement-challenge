import { Router } from 'express';

export const categoryRoutes = Router();

// TODO: implement controller and auth
categoryRoutes.get('/', (_req, res) => {
    res.sendStatus(501);
});

categoryRoutes.post('/', (_req, res) => {
    res.sendStatus(501);
});

categoryRoutes.put('/:id', (_req, res) => {
    res.sendStatus(501);
});
