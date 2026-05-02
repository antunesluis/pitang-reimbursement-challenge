import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../lib/env.vars.ts';
import { prisma } from '../lib/prisma.ts';

import type { LoginInput } from '../schemas/auth.schema.ts';
import type { Request, Response } from 'express';

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body as LoginInput;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({
                message: 'Invalid credentials',
                statusCode: 401,
            });
            return;
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            res.status(401).json({
                message: 'Invalid credentials',
                statusCode: 401,
            });
            return;
        }

        const token = jwt.sign(
            { email: user.email, role: user.role, userId: user.id },
            env.JWT_SECRET,
            {
                expiresIn: '24h',
            },
        );

        res.json({
            token,
            user: {
                createdAt: user.createdAt,
                email: user.email,
                id: user.id,
                name: user.name,
                role: user.role,
                updatedAt: user.updatedAt,
            },
        });
    } catch {
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function me(req: Request, res: Response) {
    res.json(req.user);
}
