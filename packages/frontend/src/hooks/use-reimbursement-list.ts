/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react';

import { reimbursementService } from '@/services/reimbursement.service.ts';

import type { Reimbursement } from '@/types/index.ts';

type ListParams = {
    categoryId?: string;
    limit: number;
    order: string;
    page: number;
    sort: string;
    status?: string;
};

export function useReimbursementList(params: ListParams) {
    const [data, setData] = useState<Reimbursement[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const firstLoad = useRef(true);

    const fetchPage = useCallback(async () => {
        if (firstLoad.current) setLoading(true);
        try {
            const res = await reimbursementService.list(params);
            setData(res.data);
            setTotal(res.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load');
        } finally {
            if (firstLoad.current) {
                setLoading(false);
                firstLoad.current = false;
            }
        }
    }, [params]);

    useEffect(() => {
        fetchPage();
    }, [fetchPage]);

    return { data, error, loading, total };
}
