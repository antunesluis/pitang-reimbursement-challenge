import { useAuth } from '@/contexts/auth.context.tsx';

import type { Status } from '@/types/index.ts';

export function usePermissions() {
    const { user } = useAuth();
    const role = user?.role;

    return {
        canApprove: (status: Status) =>
            role === 'MANAGER' && status === 'SUBMITTED',
        canCancel: (status: Status, ownerId: string) =>
            user?.id === ownerId &&
            (status === 'DRAFT' || status === 'SUBMITTED'),
        canEdit: (status: Status, ownerId: string) =>
            user?.id === ownerId && status === 'DRAFT',
        canPay: (status: Status) => role === 'FINANCE' && status === 'APPROVED',
        canReject: (status: Status) =>
            role === 'MANAGER' && status === 'SUBMITTED',

        canSubmit: (status: Status, ownerId: string) =>
            user?.id === ownerId && status === 'DRAFT',
        canUpload: (ownerId: string) => user?.id === ownerId,
        isAdmin: role === 'ADMIN',
        isEmployee: role === 'EMPLOYEE',
        isFinance: role === 'FINANCE',
        isManager: role === 'MANAGER',
        isOwner: (ownerId: string) => user?.id === ownerId,
        role,
    };
}
