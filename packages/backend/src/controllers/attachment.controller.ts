import { AppError } from '../lib/errors.ts';
import { prisma } from '../lib/prisma.ts';
import { reimbursementPolicy } from '../policies/reimbursement.policy.ts';

import type { Role } from '../../prisma/src/generated/prisma/enums.ts';
import type { Request, Response } from 'express';

export async function addAttachment(req: Request, res: Response) {
    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
        throw new AppError(400, 'File is required');
    }

    const reimbursement = await prisma.reimbursement.findUnique({
        select: { requesterId: true, status: true },
        where: { id },
    });

    if (!reimbursement) {
        throw new AppError(404, 'Reimbursement not found');
    }

    const isOwner = req.user!.id === reimbursement.requesterId;
    if (!isOwner) throw new AppError(403, 'Access denied');

    if (reimbursement.status !== 'DRAFT') {
        throw new AppError(
            400,
            'Attachments can only be added to DRAFT reimbursements',
        );
    }

    const attachment = await prisma.attachment.create({
        data: {
            fileName: file.originalname,
            fileType: file.mimetype,
            fileUrl: `/uploads/${file.filename}`,
            reimbursementId: id,
        },
        select: { fileName: true, fileType: true, fileUrl: true, id: true },
    });

    res.status(201).json(attachment);
}

export async function listAttachments(req: Request, res: Response) {
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({
        select: { requesterId: true, status: true },
        where: { id },
    });

    if (!reimbursement) {
        throw new AppError(404, 'Reimbursement not found');
    }

    if (
        !reimbursementPolicy.canViewAttachments({
            isOwner: req.user!.id === reimbursement.requesterId,
            role: req.user!.role as Role,
            status: reimbursement.status,
        })
    ) {
        throw new AppError(403, 'Access denied');
    }

    const attachments = await prisma.attachment.findMany({
        orderBy: { createdAt: 'desc' },
        select: { fileName: true, fileType: true, fileUrl: true, id: true },
        where: { reimbursementId: id },
    });

    res.json(attachments);
}
