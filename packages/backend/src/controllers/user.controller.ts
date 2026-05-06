import bcrypt from 'bcryptjs';

import { prisma } from '../lib/prisma.ts';

import type { UserListQuery } from '../schemas/user-list-query.schema.ts';
import type { CreateUserInput } from '../schemas/user.schema.ts';
import type { Request, Response } from 'express';

export async function create(req: Request, res: Response) {
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
}

export async function list(req: Request, res: Response) {
    const { limit, order, page, sort } = req.validatedQuery as UserListQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        prisma.user.findMany({
            orderBy: { [sort]: order },
            select: {
                createdAt: true,
                email: true,
                id: true,
                name: true,
                role: true,
                updatedAt: true,
            },
            skip,
            take: limit,
        }),
        prisma.user.count(),
    ]);

    res.json({
        data,
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    });
}
