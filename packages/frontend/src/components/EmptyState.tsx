import { FileText, type LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button.tsx';

type Props = {
    action?: {
        href: string;
        label: string;
    };
    description?: string;
    icon?: LucideIcon;
    title?: string;
};

export function EmptyState({
    action,
    description = 'Nothing here yet.',
    icon: Icon = FileText,
    title = 'No data',
}: Props) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-muted mb-4 flex h-12 w-12 items-center justify-center rounded-full">
                <Icon className="text-muted-foreground size-6" />
            </div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
                <p className="text-muted-foreground mt-1 text-sm">
                    {description}
                </p>
            )}
            {action && (
                <Button asChild className="mt-4">
                    <a href={action.href}>{action.label}</a>
                </Button>
            )}
        </div>
    );
}
