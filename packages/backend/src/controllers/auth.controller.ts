import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { env } from '../lib/env.vars.ts';
import { AppError } from '../lib/errors.ts';
import { prisma } from '../lib/prisma.ts';

import type { LoginInput } from '../schemas/auth.schema.ts';
import type { Request, Response } from 'express';

export async function login(req: Request, res: Response) {
    const { email, password } = req.body as LoginInput;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new AppError(401, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new AppError(401, 'Invalid credentials');
    }

    const token = jwt.sign(
        { email: user.email, role: user.role, userId: user.id },
        env.JWT_SECRET,
        { expiresIn: '24h' },
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
}

export async function me(req: Request, res: Response) {
    res.json(req.user);
}
