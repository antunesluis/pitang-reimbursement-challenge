export const Role = {
    ADMIN: 'ADMIN',
    EMPLOYEE: 'EMPLOYEE',
    FINANCE: 'FINANCE',
    MANAGER: 'MANAGER',
} as const;
export type Role = (typeof Role)[keyof typeof Role];
export const ROLES = Object.values(Role) as Role[];

export const Status = {
    APPROVED: 'APPROVED',
    CANCELLED: 'CANCELLED',
    DRAFT: 'DRAFT',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    SUBMITTED: 'SUBMITTED',
} as const;
export type Status = (typeof Status)[keyof typeof Status];
export const STATUSES = Object.values(Status) as Status[];

export const Action = {
    APPROVED: 'APPROVED',
    CANCELLED: 'CANCELLED',
    CREATED: 'CREATED',
    PAID: 'PAID',
    REJECTED: 'REJECTED',
    SUBMITTED: 'SUBMITTED',
    UPDATED: 'UPDATED',
} as const;
export type Action = (typeof Action)[keyof typeof Action];
export const ACTIONS = Object.values(Action) as Action[];

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

export type PaginatedResponse<T> = {
    data: T[];
    limit: number;
    page: number;
    total: number;
    totalPages: number;
};

export type ReimbursementStats = {
    approved?: number;
    approvedThisMonth?: number;
    categories?: number;
    draft?: number;
    paid?: number;
    paidAmountThisMonth?: number;
    paidThisMonth?: number;
    pending?: number;
    pendingReview?: number;
    reimbursements?: number;
    rejectedThisMonth?: number;
    submitted?: number;
    total?: number;
    users?: number;
};
