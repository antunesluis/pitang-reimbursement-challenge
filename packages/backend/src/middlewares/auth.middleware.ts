import jwt from 'jsonwebtoken';

import { env } from '../lib/env.vars.ts';
import { AppError } from '../lib/errors.ts';
import { prisma } from '../lib/prisma.ts';

import type { NextFunction, Request, Response } from 'express';

// Define o formato esperado do payload do JWT
type JwtPayload = {
    email: string;
    role: string;
    userId: string;
};

// Adiciona propriedades customizadas ao objeto req
declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                id: string;
                name: string;
                role: string;
            };
            validatedQuery?: Record<string, unknown>;
        }
    }
}

export async function authMiddleware(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new AppError(401, 'Authentication required');
    }

    // Remove "Bearer " e mantém apenas o token
    const token = authHeader.slice(7);

    let decoded: JwtPayload;
    try {
        // Valida o token usando a chave secreta
        decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch {
        throw new AppError(401, 'Invalid or expired token');
    }

    const user = await prisma.user.findUnique({
        select: { email: true, id: true, name: true, role: true },
        where: { id: decoded.userId },
    });

    if (!user) {
        throw new AppError(401, 'User not found');
    }

    // Adiciona os dados do usuário autenticado na requisição
    req.user = user;

    // Continua para o próximo middleware/controller
    next();
}
