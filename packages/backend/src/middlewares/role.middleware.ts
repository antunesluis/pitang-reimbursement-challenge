import { AppError } from '../lib/errors.ts';

import type { Role } from '../../prisma/src/generated/prisma/enums.ts';
import type { NextFunction, Request, Response } from 'express';

export function roleMiddleware(allowedRoles: Role[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        const role = req.user?.role as Role | undefined;

        if (!role) {
            throw new AppError(401, 'Authentication required');
        }

        if (!allowedRoles.includes(role)) {
            throw new AppError(403, 'Insufficient permissions');
        }

        next();
    };
}
