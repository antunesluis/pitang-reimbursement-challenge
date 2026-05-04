import { cn } from '@/lib/utils.ts';

type Props = {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    className?: string;
};

export function StatsCard({ className, icon: Icon, label, value }: Props) {
    return (
        <div className={cn('flex-1 rounded-lg border p-4', className)}>
            <div className="flex items-center gap-2">
                <Icon className="text-muted-foreground size-4" />
                <span className="text-muted-foreground text-sm font-medium">
                    {label}
                </span>
            </div>
            <p className="mt-2 text-2xl font-bold">{value}</p>
        </div>
    );
}
