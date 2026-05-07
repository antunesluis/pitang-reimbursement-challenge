import { Button } from '@/components/ui/button.tsx';
import { capitalize } from '@/lib/format.ts';
import { Status } from '@/types/index.ts';

import type { Role, Status as StatusType } from '@/types/index.ts';

const STATUSES_BY_ROLE: Record<Role, StatusType[]> = {
    ADMIN: [
        Status.DRAFT,
        Status.SUBMITTED,
        Status.APPROVED,
        Status.PAID,
        Status.REJECTED,
        Status.CANCELLED,
    ],
    EMPLOYEE: [
        Status.DRAFT,
        Status.SUBMITTED,
        Status.APPROVED,
        Status.PAID,
        Status.REJECTED,
        Status.CANCELLED,
    ],
    FINANCE: [],
    MANAGER: [],
};

type Props = {
    role: Role;
    value?: StatusType;
    onChange: (status: StatusType | undefined) => void;
};

export function StatusTabs({ onChange, role, value }: Props) {
    const statuses = STATUSES_BY_ROLE[role];
    if (statuses.length === 0) return null;

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
                    {capitalize(s)}
                </Button>
            ))}
        </div>
    );
}
