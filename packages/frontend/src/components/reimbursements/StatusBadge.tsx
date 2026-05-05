import { cn } from '@/lib/utils.ts';

import type { Status } from '@/types/index.ts';

const STYLES: Record<Status, string> = {
    APPROVED:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    CANCELLED:
        'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    PAID: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    SUBMITTED:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
};

const LABELS: Record<Status, string> = {
    APPROVED: 'Approved',
    CANCELLED: 'Cancelled',
    DRAFT: 'Draft',
    PAID: 'Paid',
    REJECTED: 'Rejected',
    SUBMITTED: 'Submitted',
};

export function StatusBadge({ status }: { status: Status }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                STYLES[status],
            )}
        >
            {LABELS[status]}
        </span>
    );
}
