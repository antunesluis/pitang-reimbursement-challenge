import { TableHead } from '@/components/ui/table.tsx';

type Props = {
    field: string;
    label: string;
    order: string;
    sort: string;
    onSort: (field: string, order: string) => void;
};

export function SortableHeader({ field, label, onSort, order, sort }: Props) {
    const isActive = sort === field;

    function handleClick() {
        const nextOrder = isActive && order === 'asc' ? 'desc' : 'asc';
        onSort(field, nextOrder);
    }

    return (
        <TableHead
            className="cursor-pointer select-none hover:text-foreground"
            onClick={handleClick}
        >
            <span className="inline-flex items-center gap-1">
                {label}
                {isActive && (
                    <span className="text-xs">{order === 'asc' ? '▲' : '▼'}</span>
                )}
            </span>
        </TableHead>
    );
}
