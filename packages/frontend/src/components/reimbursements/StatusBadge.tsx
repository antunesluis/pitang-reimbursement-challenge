import { cn } from '@/lib/utils.ts';
import { Status } from '@/types/index.ts';

const STYLES: Record<string, string> = {
    [Status.APPROVED]:
        'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
    [Status.CANCELLED]:
        'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
    [Status.DRAFT]:
        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    [Status.PAID]:
        'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
    [Status.REJECTED]:
        'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
    [Status.SUBMITTED]:
        'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400',
};

const LABELS: Record<string, string> = {
    [Status.APPROVED]: 'Approved',
    [Status.CANCELLED]: 'Cancelled',
    [Status.DRAFT]: 'Draft',
    [Status.PAID]: 'Paid',
    [Status.REJECTED]: 'Rejected',
    [Status.SUBMITTED]: 'Submitted',
};

type Props = {
    status: string;
};

export function StatusBadge({ status }: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                STYLES[status],
            )}
        >
            {LABELS[status] ?? status}
        </span>
    );
}
