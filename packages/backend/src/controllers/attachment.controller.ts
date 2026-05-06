import { AppError } from '../lib/errors.ts';
import { prisma } from '../lib/prisma.ts';

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

    if (req.user!.id !== reimbursement.requesterId) {
        throw new AppError(403, 'Access denied');
    }

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

    const isOwner = req.user!.id === reimbursement.requesterId;
    const role = req.user!.role;
    const status = reimbursement.status;

    let canView = isOwner || role === 'ADMIN';
    if (
        !canView &&
        role === 'MANAGER' &&
        (status === 'SUBMITTED' ||
            status === 'APPROVED' ||
            status === 'REJECTED')
    )
        canView = true;
    if (
        !canView &&
        role === 'FINANCE' &&
        (status === 'APPROVED' || status === 'PAID')
    )
        canView = true;

    if (!canView) {
        throw new AppError(403, 'Access denied');
    }

    const attachments = await prisma.attachment.findMany({
        orderBy: { createdAt: 'desc' },
        select: { fileName: true, fileType: true, fileUrl: true, id: true },
        where: { reimbursementId: id },
    });

    res.json(attachments);
}
