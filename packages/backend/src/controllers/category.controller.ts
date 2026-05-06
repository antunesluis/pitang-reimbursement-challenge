import { AppError } from '../lib/errors.ts';
import { prisma } from '../lib/prisma.ts';

import type {
    CreateCategoryInput,
    UpdateCategoryInput,
} from '../schemas/category.schema.ts';
import type { Request, Response } from 'express';

export async function list(_req: Request, res: Response) {
    const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
        select: {
            active: true,
            createdAt: true,
            id: true,
            name: true,
            updatedAt: true,
        },
    });

    res.json(categories);
}

export async function create(req: Request, res: Response) {
    const { name } = req.body as CreateCategoryInput;

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) {
        throw new AppError(409, 'Category name already exists');
    }

    const category = await prisma.category.create({
        data: { name },
        select: {
            active: true,
            createdAt: true,
            id: true,
            name: true,
            updatedAt: true,
        },
    });

    res.status(201).json(category);
}

export async function update(req: Request, res: Response) {
    const id = req.params.id as string;
    const { active, name } = req.body as UpdateCategoryInput;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
        throw new AppError(404, 'Category not found');
    }

    if (name && name !== category.name) {
        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) {
            throw new AppError(409, 'Category name already exists');
        }
    }

    const updated = await prisma.category.update({
        data: { active, name },
        select: {
            active: true,
            createdAt: true,
            id: true,
            name: true,
            updatedAt: true,
        },
        where: { id },
    });

    res.json(updated);
}
