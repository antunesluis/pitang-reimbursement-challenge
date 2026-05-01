import type { Role } from '../../prisma/src/generated/prisma/enums.ts';
import type { NextFunction, Request, Response } from 'express';

export function roleMiddleware(allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        const role = req.user?.role as Role | undefined;

        if (!role) {
            res.status(401).json({
                message: 'Authentication required',
                statusCode: 401,
            });
            return;
        }

        if (allowedRoles.includes(role)) {
            next();
            return;
        }

        res.status(403).json({
            message: 'Insufficient permissions',
            statusCode: 403,
        });
    };
}
