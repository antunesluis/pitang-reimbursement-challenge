import { useAuth } from '@/contexts/auth.context.tsx';
import { Role, Status } from '@/types/index.ts';

import type { Status as StatusType } from '@/types/index.ts';

export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role;

    return {
        canApprove: (status: StatusType) =>
            role === Role.MANAGER && status === Status.SUBMITTED,
        canCancel: (status: StatusType, ownerId: string) =>
            user?.id === ownerId &&
            (status === Status.DRAFT || status === Status.SUBMITTED),
        canEdit: (status: StatusType, ownerId: string) =>
            user?.id === ownerId && status === Status.DRAFT,
        canPay: (status: StatusType) =>
            role === Role.FINANCE && status === Status.APPROVED,
        canReject: (status: StatusType) =>
            role === Role.MANAGER && status === Status.SUBMITTED,

        canSubmit: (status: StatusType, ownerId: string) =>
            user?.id === ownerId && status === Status.DRAFT,
        canUpload: (ownerId: string, status: StatusType) =>
            user?.id === ownerId && status === Status.DRAFT,
        isAdmin: role === Role.ADMIN,
        isEmployee: role === Role.EMPLOYEE,
        isFinance: role === Role.FINANCE,
        isManager: role === Role.MANAGER,
        isOwner: (ownerId: string) => user?.id === ownerId,
        role,
    };
}
