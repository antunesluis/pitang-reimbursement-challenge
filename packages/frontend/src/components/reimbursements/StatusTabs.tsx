import { Button } from '@/components/ui/button.tsx';

import type { Role, Status } from '@/types/index.ts';

const STATUSES_BY_ROLE: Record<Role, Status[]> = {
    ADMIN: [
        'DRAFT',
        'SUBMITTED',
        'APPROVED',
        'PAID',
        'REJECTED',
        'CANCELLED',
    ],
    EMPLOYEE: [
        'DRAFT',
        'SUBMITTED',
        'APPROVED',
        'PAID',
        'REJECTED',
        'CANCELLED',
    ],
    FINANCE: ['APPROVED', 'PAID'],
    MANAGER: ['SUBMITTED', 'APPROVED', 'REJECTED'],
};

type Props = {
    role: Role;
    value?: Status;
    onChange: (status: Status | undefined) => void;
};

export function StatusTabs({ onChange, role, value }: Props) {
    const statuses = STATUSES_BY_ROLE[role];

    return (
        <div className="flex flex-wrap gap-1">
            <Button
                onClick={() => onChange(undefined)}
                size="sm"
                variant={!value ? 'default' : 'ghost'}
            >
                All
            </Button>
            {statuses.map((s) => (
                <Button
                    key={s}
                    onClick={() => onChange(s)}
                    size="sm"
                    variant={value === s ? 'default' : 'ghost'}
                >
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                </Button>
            ))}
        </div>
    );
}
