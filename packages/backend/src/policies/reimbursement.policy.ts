import { AppError } from '../lib/errors.ts';

import type { Role, Status } from '../../prisma/src/generated/prisma/enums.ts';

type PolicyContext = {
    isOwner: boolean;
    role: Role;
    status: Status;
};

const fixedStatus: Partial<Record<string, Status>> = {
    FINANCE: 'APPROVED',
    MANAGER: 'SUBMITTED',
};

export const reimbursementPolicy = {
    canAddAttachment: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === 'DRAFT',

    canApprove: ({ role, status }: PolicyContext) =>
        role === 'MANAGER' && status === 'SUBMITTED',

    canCancel: ({ isOwner, status }: PolicyContext) =>
        isOwner && ['DRAFT', 'SUBMITTED'].includes(status),

    canEdit: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === 'DRAFT',

    canPay: ({ role, status }: PolicyContext) =>
        role === 'FINANCE' && status === 'APPROVED',

    canReject: ({ role, status }: PolicyContext) =>
        role === 'MANAGER' && status === 'SUBMITTED',

    canSubmit: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === 'DRAFT',

    canView: ({ isOwner, role, status }: PolicyContext) => {
        if (isOwner || role === 'ADMIN') return true;
        const fixed = fixedStatus[role];
        return fixed === status;
    },

    canViewAttachments: (ctx: PolicyContext) =>
        reimbursementPolicy.canView(ctx),

    getStatusFilter: (role: Role, requested?: Status): Status | undefined => {
        const fixed = fixedStatus[role];
        if (fixed) {
            if (requested && requested !== fixed)
                throw new AppError(
                    400,
                    `Cannot filter by status "${requested}" with your role`,
                );
            return fixed;
        }
        return requested;
    },
};
