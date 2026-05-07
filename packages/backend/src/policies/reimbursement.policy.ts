import { Role, Status } from '../../prisma/src/generated/prisma/enums.ts';
import { AppError } from '../lib/errors.ts';

import type {
    Role as RoleType,
    Status as StatusType,
} from '../../prisma/src/generated/prisma/enums.ts';

type PolicyContext = {
    isOwner: boolean;
    role: RoleType;
    status: StatusType;
};

const fixedStatus: Partial<Record<string, StatusType>> = {
    [Role.FINANCE]: Status.APPROVED,
    [Role.MANAGER]: Status.SUBMITTED,
};

export const reimbursementPolicy = {
    canAddAttachment: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === Status.DRAFT,

    canApprove: ({ role, status }: PolicyContext) =>
        role === Role.MANAGER && status === Status.SUBMITTED,

    canCancel: ({ isOwner, status }: PolicyContext) =>
        isOwner &&
        [Status.DRAFT, Status.SUBMITTED].includes(status),

    canEdit: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === Status.DRAFT,

    canPay: ({ role, status }: PolicyContext) =>
        role === Role.FINANCE && status === Status.APPROVED,

    canReject: ({ role, status }: PolicyContext) =>
        role === Role.MANAGER && status === Status.SUBMITTED,

    canSubmit: ({ isOwner, status }: PolicyContext) =>
        isOwner && status === Status.DRAFT,

    canView: ({ isOwner, role, status }: PolicyContext) => {
        if (isOwner || role === Role.ADMIN) return true;
        const fixed = fixedStatus[role];
        return fixed === status;
    },

    canViewAttachments: (ctx: PolicyContext) =>
        reimbursementPolicy.canView(ctx),

    getStatusFilter: (
        role: RoleType,
        requested?: StatusType,
    ): StatusType | undefined => {
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