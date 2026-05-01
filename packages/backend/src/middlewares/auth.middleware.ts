import type { NextFunction, Request, Response } from 'express';

// TODO: implement JWT verification
export function authMiddleware(
    _req: Request,
    _res: Response,
    next: NextFunction,
) {
    next();
}
