/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useState } from 'react';

import { reimbursementService } from '@/services/reimbursement.service.ts';
import { Status } from '@/types/index.ts';

import type { Reimbursement } from '@/types/index.ts';

export function useReimbursementEdit(id: string) {
    const [data, setData] = useState<null | Reimbursement>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const reimbursement = await reimbursementService.getById(id);
            if (reimbursement.status !== Status.DRAFT) {
                setLoadError('Only DRAFT reimbursements can be edited');
                return;
            }
            setData(reimbursement);
        } catch (err) {
            setLoadError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { data, loadError, loading, refetch: fetchData };
}
