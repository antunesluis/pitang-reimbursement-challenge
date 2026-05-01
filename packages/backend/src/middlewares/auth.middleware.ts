import jwt from 'jsonwebtoken';

import { env } from '../lib/env.vars.ts';
import { prisma } from '../lib/prisma.ts';

import type { NextFunction, Request, Response } from 'express';

type JwtPayload = {
    email: string;
    role: string;
    userId: string;
};

declare global {
    namespace Express {
        interface Request {
            user?: {
                email: string;
                id: string;
                name: string;
                role: string;
            };
        }
    }
}

export async function authMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({
                message: 'Authentication required',
                statusCode: 401,
            });
            return;
        }

        const token = authHeader.slice(7);
        const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

        const user = await prisma.user.findUnique({
            select: { email: true, id: true, name: true, role: true },
            where: { id: decoded.userId },
        });

        if (!user) {
            res.status(401).json({
                message: 'User not found',
                statusCode: 401,
            });
            return;
        }

        req.user = user;
        next();
    } catch {
        res.status(401).json({
            message: 'Invalid or expired token',
            statusCode: 401,
        });
    }
}
