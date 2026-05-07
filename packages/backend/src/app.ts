import path from 'node:path';

import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { AppError } from './lib/errors.ts';
import { errorFallbackMiddleware } from './middlewares/error.fallback.middleware.ts';
import { authRoutes } from './routes/auth.routes.ts';
import { categoryRoutes } from './routes/category.routes.ts';
import { reimbursementRoutes } from './routes/reimbursement.routes.ts';
import { userRoutes } from './routes/user.routes.ts';

const app = express();

app.use(express.json());

// Permite que frontends externos consumam a API
app.use(
    cors({
        allowedHeaders: ['Content-Type', 'Authorization'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        origin: '*',
    }),
);

// Middleware de segurança HTTP, adiciona vários headers de proteção automaticamente
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Expõe a pasta uploads publicamente
// Tudo que estiver dentro de ../uploads poderá ser acessado via URL
app.use(
    '/uploads',
    express.static(path.resolve(import.meta.dirname, '../uploads')),
);

app.get('/', (_req, res) => {
    res.json({ message: 'API running' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/categories', categoryRoutes);
app.use('/reimbursements', reimbursementRoutes);

// Middleware executado caso nenhuma rota anterior seja encontrada
app.use((_req) => {
    throw new AppError(404, 'Route not found');
});

// Middleware global de tratamento de erros
app.use(errorFallbackMiddleware);

export { app };
