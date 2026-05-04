import { prisma } from "../lib/prisma.ts";

import type { Request, Response } from "express";

export async function addAttachment(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ message: "File is required", statusCode: 400 });
      return;
    }

    const reimbursement = await prisma.reimbursement.findUnique({
      select: { requesterId: true },
      where: { id },
    });

    if (!reimbursement) {
      res.status(404).json({ message: "Reimbursement not found", statusCode: 404 });
      return;
    }

    if (req.user!.id !== reimbursement.requesterId) {
      res.status(403).json({ message: "Access denied", statusCode: 403 });
      return;
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", statusCode: 500 });
  }
}

export async function listAttachments(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const reimbursement = await prisma.reimbursement.findUnique({
      select: { requesterId: true, status: true },
      where: { id },
    });

    if (!reimbursement) {
      res.status(404).json({ message: "Reimbursement not found", statusCode: 404 });
      return;
    }

    const isOwner = req.user!.id === reimbursement.requesterId;
    const role = req.user!.role;
    const status = reimbursement.status;

    let canView = isOwner || role === "ADMIN";
    if (!canView && role === "MANAGER" && status !== "DRAFT" && status !== "CANCELLED")
      canView = true;
    if (!canView && role === "FINANCE" && (status === "APPROVED" || status === "PAID"))
      canView = true;

    if (!canView) {
      res.status(403).json({ message: "Access denied", statusCode: 403 });
      return;
    }

    const attachments = await prisma.attachment.findMany({
      orderBy: { createdAt: "desc" },
      select: { fileName: true, fileType: true, fileUrl: true, id: true },
      where: { reimbursementId: id },
    });

    res.json(attachments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", statusCode: 500 });
  }
}
