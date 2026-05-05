import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'bun:test';

import { AuthContext } from '@/contexts/auth.context.tsx';
import { usePermissions } from '@/hooks/use-permissions.ts';

import type { User } from '@/types/index.ts';
import type { ReactNode } from 'react';

function makeWrapper(role: null | User['role']) {
    const user = role
        ? ({
              createdAt: '2026-01-01',
              email: 'test@test.com',
              id: 'user-1',
              name: 'Test',
              role,
              updatedAt: '2026-01-01',
          } satisfies User)
        : null;

    return function Wrapper({ children }: { children: ReactNode }) {
        return (
            <AuthContext.Provider
                value={{
                    isAuthenticated: !!user,
                    isLoading: false,
                    login: async () => {},
                    logout: () => {},
                    user: user ?? null,
                }}
            >
                {children}
            </AuthContext.Provider>
        );
    };
}

describe('usePermissions', () => {
    describe('role checks', () => {
        it('isAdmin is true for ADMIN role', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('ADMIN'),
            });
            expect(result.current.isAdmin).toBe(true);
            expect(result.current.isEmployee).toBe(false);
            expect(result.current.isManager).toBe(false);
            expect(result.current.isFinance).toBe(false);
        });

        it('isEmployee is true for EMPLOYEE role', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.isAdmin).toBe(false);
            expect(result.current.isEmployee).toBe(true);
            expect(result.current.isManager).toBe(false);
            expect(result.current.isFinance).toBe(false);
        });

        it('isManager is true for MANAGER role', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('MANAGER'),
            });
            expect(result.current.isAdmin).toBe(false);
            expect(result.current.isEmployee).toBe(false);
            expect(result.current.isManager).toBe(true);
            expect(result.current.isFinance).toBe(false);
        });

        it('isFinance is true for FINANCE role', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('FINANCE'),
            });
            expect(result.current.isAdmin).toBe(false);
            expect(result.current.isEmployee).toBe(false);
            expect(result.current.isManager).toBe(false);
            expect(result.current.isFinance).toBe(true);
        });

        it('all role checks are false when user is null', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper(null),
            });
            expect(result.current.isAdmin).toBe(false);
            expect(result.current.isEmployee).toBe(false);
            expect(result.current.isManager).toBe(false);
            expect(result.current.isFinance).toBe(false);
            expect(result.current.role).toBeUndefined();
        });
    });

    describe('action checks', () => {
        it('isOwner returns true for matching user id', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.isOwner('user-1')).toBe(true);
            expect(result.current.isOwner('other-user')).toBe(false);
        });

        it('canEdit is true for DRAFT and owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canEdit('DRAFT', 'user-1')).toBe(true);
        });

        it('canEdit is false for SUBMITTED even if owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canEdit('SUBMITTED', 'user-1')).toBe(false);
        });

        it('canEdit is false for DRAFT if not owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canEdit('DRAFT', 'other-user')).toBe(false);
        });

        it('canSubmit is true for DRAFT and owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canSubmit('DRAFT', 'user-1')).toBe(true);
        });

        it('canSubmit is false for SUBMITTED', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canSubmit('SUBMITTED', 'user-1')).toBe(false);
        });

        it('canApprove is true for MANAGER with SUBMITTED status', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('MANAGER'),
            });
            expect(result.current.canApprove('SUBMITTED')).toBe(true);
        });

        it('canApprove is false for FINANCE with SUBMITTED status', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('FINANCE'),
            });
            expect(result.current.canApprove('SUBMITTED')).toBe(false);
        });

        it('canReject is true for MANAGER with SUBMITTED status', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('MANAGER'),
            });
            expect(result.current.canReject('SUBMITTED')).toBe(true);
        });

        it('canPay is true for FINANCE with APPROVED status', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('FINANCE'),
            });
            expect(result.current.canPay('APPROVED')).toBe(true);
        });

        it('canPay is false for MANAGER with APPROVED status', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('MANAGER'),
            });
            expect(result.current.canPay('APPROVED')).toBe(false);
        });

        it('canCancel is true for DRAFT and owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canCancel('DRAFT', 'user-1')).toBe(true);
        });

        it('canCancel is true for SUBMITTED and owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canCancel('SUBMITTED', 'user-1')).toBe(true);
        });

        it('canCancel is false for APPROVED even if owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canCancel('APPROVED', 'user-1')).toBe(false);
        });

        it('canUpload is true for owner', () => {
            const { result } = renderHook(() => usePermissions(), {
                wrapper: makeWrapper('EMPLOYEE'),
            });
            expect(result.current.canUpload('user-1')).toBe(true);
            expect(result.current.canUpload('other-user')).toBe(false);
        });
    });
});
