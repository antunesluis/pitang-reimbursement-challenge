import { useEffect, useState } from 'react';

import { reimbursementService } from '@/services/reimbursement.service.ts';

import type { Reimbursement } from '@/types/index.ts';
import type { ReimbursementStats } from '@/types/index.ts';

export function useDashboardStats() {
    const [recent, setRecent] = useState<Reimbursement[]>([]);
    const [stats, setStats] = useState<ReimbursementStats>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                const [statsData, reimbs] = await Promise.all([
                    reimbursementService.getStats(),
                    reimbursementService.list({ limit: 5, page: 1 }),
                ]);
                setStats(statsData);
                setRecent(reimbs.data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load',
                );
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    return { error, loading, recent, stats };
}
