import { TableCell, TableRow } from '@/components/ui/table.tsx';

type Props = {
    colSpan: number;
    message: string;
};

export function EmptyTableRow({ colSpan, message }: Props) {
    return (
        <TableRow>
            <TableCell
                className="text-muted-foreground text-center"
                colSpan={colSpan}
            >
                {message}
            </TableCell>
        </TableRow>
    );
}
