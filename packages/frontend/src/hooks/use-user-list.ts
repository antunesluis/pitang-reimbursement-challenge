/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from 'react';

import { userService } from '@/services/user.service.ts';

import type { User } from '@/types/index.ts';

type ListParams = {
    limit: number;
    order: string;
    page: number;
    sort: string;
};

export function useUserList(params: ListParams) {
    const [users, setUsers] = useState<User[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const firstLoad = useRef(true);

    const fetchPage = useCallback(async () => {
        if (firstLoad.current) setLoading(true);
        try {
            const res = await userService.list(params);
            setUsers(res.data);
            setTotal(res.total);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Failed to load users',
            );
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

    return { error, loading, total, users };
}
