import dayjs from 'dayjs';

import { prisma } from '../lib/prisma.ts';

import type {
    Action,
    Status,
} from '../../prisma/src/generated/prisma/enums.ts';
import type { ListQuery } from '../schemas/list-query.schema.ts';
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
    if (isOwner(req, reimbursement)) return true;
    if (isAdmin(req)) return true;
    if (
        isManager(req) &&
        (reimbursement.status === 'SUBMITTED' ||
            reimbursement.status === 'APPROVED' ||
            reimbursement.status === 'REJECTED')
    )
        return true;
    if (
        isFinance(req) &&
        (reimbursement.status === 'APPROVED' || reimbursement.status === 'PAID')
    )
        return true;
    return false;
}

function isFutureDate(date: Date): boolean {
    return dayjs(date).isAfter(dayjs(), 'day');
}

export async function create(req: Request, res: Response) {
    const { amount, categoryId, description, expenseDate } =
        req.body as CreateReimbursementInput;

    if (isFutureDate(expenseDate)) {
        res.status(400).json({
            message: 'Expense date cannot be in the future',
            statusCode: 400,
        });
        return;
    }

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
}

export async function list(req: Request, res: Response) {
    const { id: userId, role } = req.user!;
    const { categoryId, limit, order, page, sort, status } =
        req.validatedQuery as ListQuery;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (role === 'EMPLOYEE') {
        where.requesterId = userId;
    }

    const allowedStatuses: Record<string, Status[]> = {
        ADMIN: [
            'APPROVED',
            'CANCELLED',
            'DRAFT',
            'PAID',
            'REJECTED',
            'SUBMITTED',
        ],
        EMPLOYEE: [
            'APPROVED',
            'CANCELLED',
            'DRAFT',
            'PAID',
            'REJECTED',
            'SUBMITTED',
        ],
        FINANCE: ['APPROVED', 'PAID'],
        MANAGER: ['SUBMITTED', 'APPROVED', 'REJECTED'],
    };

    if (status) {
        if (!allowedStatuses[role]?.includes(status)) {
            res.status(400).json({
                message: `Cannot filter by status "${status}" with your role`,
                statusCode: 400,
            });
            return;
        }
        where.status = status;
    } else if (role === 'MANAGER') {
        where.status = 'SUBMITTED';
    } else if (role === 'FINANCE') {
        where.status = 'APPROVED';
    }

    if (categoryId) {
        where.categoryId = categoryId;
    }

    const [data, total] = await Promise.all([
        prisma.reimbursement.findMany({
            orderBy: { [sort]: order },
            select: selectReimbursement,
            skip,
            take: limit,
            where,
        }),
        prisma.reimbursement.count({ where }),
    ]);

    res.json({
        data,
        limit,
        page,
        total,
        totalPages: Math.ceil(total / limit),
    });
}

export async function getById(req: Request, res: Response) {
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
}

export async function update(req: Request, res: Response) {
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

    if (data.expenseDate && isFutureDate(data.expenseDate)) {
        res.status(400).json({
            message: 'Expense date cannot be in the future',
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
}

export async function approve(req: Request, res: Response) {
    const reimbursement = await transitionStatus(req, res, 'SUBMITTED');
    if (!reimbursement) return;

    if (!isManager(req)) {
        res.status(403).json({ message: 'Access denied', statusCode: 403 });
        return;
    }

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
}

export async function reject(req: Request, res: Response) {
    const { rejectionReason } = req.body as RejectReimbursementInput;

    const reimbursement = await transitionStatus(req, res, 'SUBMITTED');
    if (!reimbursement) return;

    if (!isManager(req)) {
        res.status(403).json({ message: 'Access denied', statusCode: 403 });
        return;
    }

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
}

export async function pay(req: Request, res: Response) {
    const reimbursement = await transitionStatus(req, res, 'APPROVED');
    if (!reimbursement) return;

    if (!isFinance(req)) {
        res.status(403).json({ message: 'Access denied', statusCode: 403 });
        return;
    }

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
}

export async function cancel(req: Request, res: Response) {
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
}

export async function getHistory(req: Request, res: Response) {
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
}

export async function getStats(req: Request, res: Response) {
    const { id: userId, role } = req.user!;
    const startOfMonth = dayjs().startOf('month').toDate();
    const endOfMonth = dayjs().endOf('month').toDate();

    if (role === 'EMPLOYEE') {
        const where = { requesterId: userId };
        const [total, draft, submitted, approved, paid] = await Promise.all([
            prisma.reimbursement.count({ where }),
            prisma.reimbursement.count({
                where: { ...where, status: 'DRAFT' },
            }),
            prisma.reimbursement.count({
                where: { ...where, status: 'SUBMITTED' },
            }),
            prisma.reimbursement.count({
                where: { ...where, status: 'APPROVED' },
            }),
            prisma.reimbursement.count({
                where: { ...where, status: 'PAID' },
            }),
        ]);
        res.json({ approved, draft, paid, submitted, total });
        return;
    }

    if (role === 'MANAGER') {
        const [pending, approvedThisMonth, rejectedThisMonth] =
            await Promise.all([
                prisma.reimbursement.count({
                    where: { status: 'SUBMITTED' },
                }),
                prisma.reimbursement.count({
                    where: {
                        status: 'APPROVED',
                        updatedAt: { gte: startOfMonth, lte: endOfMonth },
                    },
                }),
                prisma.reimbursement.count({
                    where: {
                        status: 'REJECTED',
                        updatedAt: { gte: startOfMonth, lte: endOfMonth },
                    },
                }),
            ]);
        res.json({ approvedThisMonth, pending, rejectedThisMonth });
        return;
    }

    if (role === 'FINANCE') {
        const [pending, paidThisMonth, volumeThisMonth] = await Promise.all([
            prisma.reimbursement.count({
                where: { status: 'APPROVED' },
            }),
            prisma.reimbursement.count({
                where: {
                    status: 'PAID',
                    updatedAt: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
            prisma.reimbursement.count({
                where: {
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                },
            }),
        ]);
        res.json({ paidThisMonth, pending, volumeThisMonth });
        return;
    }

    if (role === 'ADMIN') {
        const [reimbursements, pendingReview, users, categories] =
            await Promise.all([
                prisma.reimbursement.count(),
                prisma.reimbursement.count({
                    where: { status: 'SUBMITTED' },
                }),
                prisma.user.count(),
                prisma.category.count(),
            ]);
        res.json({ categories, pendingReview, reimbursements, users });
        return;
    }

    res.json({});
}
