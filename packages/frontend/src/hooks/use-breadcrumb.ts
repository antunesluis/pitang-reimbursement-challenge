import { useMatches } from '@tanstack/react-router';

type BreadcrumbItem = {
    isLast: boolean;
    label: string;
    path: string;
};

export function useBreadcrumb(): BreadcrumbItem[] {
    const matches = useMatches();

    return matches
        .filter(
            (m) =>
                'staticData' in m &&
                m.staticData &&
                (m.staticData as Record<string, unknown>).breadcrumb,
        )
        .map((m, i, arr) => ({
            isLast: i === arr.length - 1,
            label: (m.staticData as Record<string, string>)
                .breadcrumb as string,
            path: m.pathname,
        }));
}
