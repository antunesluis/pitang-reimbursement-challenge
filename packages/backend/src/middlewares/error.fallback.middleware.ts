import { env } from '../lib/env.vars.ts';

import type { NextFunction, Request, Response } from 'express';

export function errorFallbackMiddleware(
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
) {
    console.error(error.stack);

    const statusCode = response.statusCode >= 400 ? response.statusCode : 500;

    if (env.NODE_ENV === 'development') {
        response.status(statusCode).json({
            message: error.message,
            stack: error.stack,
            statusCode,
        });
        return;
    }

    response
        .status(statusCode)
        .json({ message: 'Internal server error', statusCode });
}
