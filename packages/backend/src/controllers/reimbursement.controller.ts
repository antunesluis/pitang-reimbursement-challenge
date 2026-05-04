import { prisma } from '../lib/prisma.ts';

import type {
    Action,
    Status,
} from '../../prisma/src/generated/prisma/enums.ts';
import type {
    CreateReimbursementInput,
    RejectReimbursementInput,
    UpdateReimbursementInput,
} from '../schemas/reimbursement.schema.ts';
import type { Request, Response } from 'express';

async function recordHistory(
    reimbursementId: string,
    userId: string,
    action: Action,
    observation: string,
) {
    await prisma.history.create({
        data: {
            action,
            observation,
            reimbursementId,
            userId,
        },
    });
}

const selectReimbursement = {
    amount: true,
    category: { select: { active: true, id: true, name: true } },
    createdAt: true,
    description: true,
    expenseDate: true,
    id: true,
    rejectionReason: true,
    requester: { select: { email: true, id: true, name: true } },
    requesterId: true,
    status: true,
    updatedAt: true,
} as const;

function isOwner(req: Request, reimbursement: { requesterId: string }) {
    return req.user!.id === reimbursement.requesterId;
}

function isManager(req: Request) {
    return req.user!.role === 'MANAGER';
}

function isFinance(req: Request) {
    return req.user!.role === 'FINANCE';
}

function isAdmin(req: Request) {
    return req.user!.role === 'ADMIN';
}

function canView(
    req: Request,
    reimbursement: { requesterId: string; status: string },
) {
    // Owner and admin see everything
    if (isOwner(req, reimbursement)) return true;
    if (isAdmin(req)) return true;
    // Manager sees submitted + everything downstream (approved/pay flow)
    if (isManager(req) && reimbursement.status !== 'DRAFT' &&
        reimbursement.status !== 'CANCELLED') return true;
    // Finance sees approved + paid (their queue + what they processed)
    if (isFinance(req) &&
        (reimbursement.status === 'APPROVED' || reimbursement.status === 'PAID'))
        return true;
    return false;
}

export async function create(req: Request, res: Response) {
    try {
        const { amount, categoryId, description, expenseDate } =
            req.body as CreateReimbursementInput;

        const category = await prisma.category.findUnique({
            where: { id: categoryId },
        });
        if (!category || !category.active) {
            res.status(400).json({
                message: 'Category not found or inactive',
                statusCode: 400,
            });
            return;
        }

        const reimbursement = await prisma.reimbursement.create({
            data: {
                amount,
                categoryId,
                description,
                expenseDate,
                requesterId: req.user!.id,
                status: 'DRAFT',
            },
            select: selectReimbursement,
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'CREATED',
            'Reimbursement created',
        );

        res.status(201).json(reimbursement);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function list(req: Request, res: Response) {
    try {
        const { id: userId, role } = req.user!;

        const where: Record<string, unknown> = {};

        if (role === 'EMPLOYEE') {
            where.requesterId = userId;
        } else if (role === 'MANAGER') {
            where.status = 'SUBMITTED';
        } else if (role === 'FINANCE') {
            where.status = 'APPROVED';
        }

        const reimbursements = await prisma.reimbursement.findMany({
            orderBy: { createdAt: 'desc' },
            select: selectReimbursement,
            where,
        });

        res.json(reimbursements);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function getById(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const reimbursement = await prisma.reimbursement.findUnique({
            select: {
                ...selectReimbursement,
                attachments: {
                    select: {
                        fileName: true,
                        fileType: true,
                        fileUrl: true,
                        id: true,
                    },
                },
            },
            where: { id },
        });

        if (!reimbursement) {
            res.status(404).json({
                message: 'Reimbursement not found',
                statusCode: 404,
            });
            return;
        }

        if (!canView(req, reimbursement)) {
            res.status(403).json({ message: 'Access denied', statusCode: 403 });
            return;
        }

        res.json(reimbursement);
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
        const data = req.body as UpdateReimbursementInput;

        const reimbursement = await prisma.reimbursement.findUnique({
            where: { id },
        });
        if (!reimbursement) {
            res.status(404).json({
                message: 'Reimbursement not found',
                statusCode: 404,
            });
            return;
        }

        if (!isOwner(req, reimbursement)) {
            res.status(403).json({ message: 'Access denied', statusCode: 403 });
            return;
        }

        if (reimbursement.status !== 'DRAFT') {
            res.status(400).json({
                message: 'Only DRAFT reimbursements can be edited',
                statusCode: 400,
            });
            return;
        }

        if (data.categoryId) {
            const category = await prisma.category.findUnique({
                where: { id: data.categoryId },
            });
            if (!category || !category.active) {
                res.status(400).json({
                    message: 'Category not found or inactive',
                    statusCode: 400,
                });
                return;
            }
        }

        const updated = await prisma.reimbursement.update({
            data,
            select: selectReimbursement,
            where: { id },
        });

        await recordHistory(
            id,
            req.user!.id,
            'UPDATED',
            'Reimbursement updated',
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

async function transitionStatus(
    req: Request,
    res: Response,
    fromStatus: Status | Status[],
) {
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({
        where: { id },
    });
    if (!reimbursement) {
        res.status(404).json({
            message: 'Reimbursement not found',
            statusCode: 404,
        });
        return null;
    }

    const allowed = Array.isArray(fromStatus) ? fromStatus : [fromStatus];
    if (!allowed.includes(reimbursement.status as Status)) {
        res.status(400).json({
            message: 'Invalid status transition',
            statusCode: 400,
        });
        return null;
    }

    return reimbursement;
}

export async function submit(req: Request, res: Response) {
    try {
        const reimbursement = await transitionStatus(req, res, 'DRAFT');
        if (!reimbursement) return;

        if (!isOwner(req, reimbursement)) {
            res.status(403).json({ message: 'Access denied', statusCode: 403 });
            return;
        }

        const updated = await prisma.reimbursement.update({
            data: { status: 'SUBMITTED' },
            select: selectReimbursement,
            where: { id: reimbursement.id },
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'SUBMITTED',
            'Reimbursement submitted for review',
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function approve(req: Request, res: Response) {
    try {
        const reimbursement = await transitionStatus(req, res, 'SUBMITTED');
        if (!reimbursement) return;

        const updated = await prisma.reimbursement.update({
            data: { status: 'APPROVED' },
            select: selectReimbursement,
            where: { id: reimbursement.id },
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'APPROVED',
            'Reimbursement approved by manager',
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function reject(req: Request, res: Response) {
    try {
        const { rejectionReason } = req.body as RejectReimbursementInput;

        const reimbursement = await transitionStatus(req, res, 'SUBMITTED');
        if (!reimbursement) return;

        const updated = await prisma.reimbursement.update({
            data: { rejectionReason, status: 'REJECTED' },
            select: selectReimbursement,
            where: { id: reimbursement.id },
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'REJECTED',
            `Reimbursement rejected: ${rejectionReason}`,
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function pay(req: Request, res: Response) {
    try {
        const reimbursement = await transitionStatus(req, res, 'APPROVED');
        if (!reimbursement) return;

        const updated = await prisma.reimbursement.update({
            data: { status: 'PAID' },
            select: selectReimbursement,
            where: { id: reimbursement.id },
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'PAID',
            'Payment processed by finance',
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function cancel(req: Request, res: Response) {
    try {
        const reimbursement = await transitionStatus(req, res, [
            'DRAFT',
            'SUBMITTED',
        ]);
        if (!reimbursement) return;

        if (!isOwner(req, reimbursement)) {
            res.status(403).json({ message: 'Access denied', statusCode: 403 });
            return;
        }

        const updated = await prisma.reimbursement.update({
            data: { status: 'CANCELLED' },
            select: selectReimbursement,
            where: { id: reimbursement.id },
        });

        await recordHistory(
            reimbursement.id,
            req.user!.id,
            'CANCELLED',
            'Reimbursement cancelled by requester',
        );

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}

export async function getHistory(req: Request, res: Response) {
    try {
        const id = req.params.id as string;

        const reimbursement = await prisma.reimbursement.findUnique({
            select: { requesterId: true, status: true },
            where: { id },
        });

        if (!reimbursement) {
            res.status(404).json({
                message: 'Reimbursement not found',
                statusCode: 404,
            });
            return;
        }

        if (!canView(req, reimbursement)) {
            res.status(403).json({ message: 'Access denied', statusCode: 403 });
            return;
        }

        const history = await prisma.history.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                action: true,
                createdAt: true,
                id: true,
                observation: true,
                user: { select: { id: true, name: true } },
            },
            where: { reimbursementId: id },
        });

        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Internal server error',
            statusCode: 500,
        });
    }
}
