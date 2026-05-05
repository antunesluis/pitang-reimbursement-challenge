import { useEffect, useState } from 'react';

import { Skeleton } from '@/components/ui/skeleton.tsx';
import { categoryService } from '@/services/category.service.ts';

type Props = {
    onChange: (value: string) => void;
    value: string;
};

export function CategorySelect({ onChange, value }: Props) {
    const [categories, setCategories] = useState<
        { id: string; name: string }[]
    >([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        categoryService
            .list()
            .then((data) => setCategories(data.filter((c) => c.active)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <Skeleton className="h-10 w-full" />;

    return (
        <select
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            onChange={(e) => onChange(e.target.value)}
            value={value}
        >
            <option value="">Select a category</option>
            {categories.map((c) => (
                <option key={c.id} value={c.id}>
                    {c.name}
                </option>
            ))}
        </select>
    );
}
