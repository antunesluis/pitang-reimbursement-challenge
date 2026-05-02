import { prisma } from '../lib/prisma.ts';

import type {
    CreateCategoryInput,
    UpdateCategoryInput,
} from '../schemas/category.schema.ts';
import type { Request, Response } from 'express';

export async function list(_req: Request, res: Response) {
    try {
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function create(req: Request, res: Response) {
    try {
        const { name } = req.body as CreateCategoryInput;

        const existing = await prisma.category.findUnique({ where: { name } });
        if (existing) {
            res.status(409).json({
                message: 'Category name already exists',
                statusCode: 409,
            });
            return;
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function update(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const { active, name } = req.body as UpdateCategoryInput;

        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) {
            res.status(404).json({
                message: 'Category not found',
                statusCode: 404,
            });
            return;
        }

        if (name && name !== category.name) {
            const existing = await prisma.category.findUnique({
                where: { name },
            });
            if (existing) {
                res.status(409).json({
                    message: 'Category name already exists',
                    statusCode: 409,
                });
                return;
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
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}
