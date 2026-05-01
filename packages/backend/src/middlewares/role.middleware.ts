import type { NextFunction, Request, Response } from 'express';

// TODO: implement role-based authorization
export function roleMiddleware(_roles: string[]) {
    return (_req: Request, _res: Response, next: NextFunction) => {
        next();
    };
}
