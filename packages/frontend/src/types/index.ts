export const ROLES = ['ADMIN', 'EMPLOYEE', 'FINANCE', 'MANAGER'] as const;
export type Role = (typeof ROLES)[number];

export const STATUSES = [
    'APPROVED',
    'CANCELLED',
    'DRAFT',
    'PAID',
    'REJECTED',
    'SUBMITTED',
] as const;
export type Status = (typeof STATUSES)[number];

export const ACTIONS = [
    'APPROVED',
    'CANCELLED',
    'CREATED',
    'PAID',
    'REJECTED',
    'SUBMITTED',
    'UPDATED',
] as const;
export type Action = (typeof ACTIONS)[number];

export type User = {
    createdAt: string;
    email: string;
    id: string;
    name: string;
    role: Role;
    updatedAt: string;
};

export type Category = {
    active: boolean;
    createdAt: string;
    id: string;
    name: string;
    updatedAt: string;
};

export type Reimbursement = {
    amount: number;
    attachments?: Attachment[];
    category: Category;
    createdAt: string;
    description: string;
    expenseDate: string;
    id: string;
    rejectionReason: null | string;
    requester: Pick<User, 'email' | 'id' | 'name'>;
    requesterId: string;
    status: Status;
    updatedAt: string;
};

export type HistoryEntry = {
    action: Action;
    createdAt: string;
    id: string;
    observation: null | string;
    user: Pick<User, 'id' | 'name'>;
};

export type Attachment = {
    fileName: string;
    fileType: string;
    fileUrl: string;
    id: string;
};

export type LoginResponse = {
    token: string;
    user: User;
};

export type ReimbursementStats = {
    approved?: number;
    approvedThisMonth?: number;
    categories?: number;
    draft?: number;
    paid?: number;
    paidThisMonth?: number;
    pending?: number;
    pendingReview?: number;
    reimbursements?: number;
    rejectedThisMonth?: number;
    submitted?: number;
    total?: number;
    users?: number;
    volumeThisMonth?: number;
};
