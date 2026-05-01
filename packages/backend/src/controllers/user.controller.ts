import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma.ts';

import type { CreateUserInput } from '../schemas/user.schema.ts';
import type { Request, Response } from 'express';

export async function create(req: Request, res: Response) {
    try {
        const { email, name, password, role } = req.body as CreateUserInput;

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({
                message: 'Email already in use',
                statusCode: 409,
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: { email, name, password: hashedPassword, role },
            select: {
                createdAt: true,
                email: true,
                id: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        res.status(201).json(user);
    } catch {
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function list(_req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                createdAt: true,
                email: true,
                id: true,
                name: true,
                role: true,
                updatedAt: true,
            },
        });

        res.json(users);
    } catch {
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}
