import { env } from '../lib/env.vars.ts';

import type { NextFunction, Request, Response } from 'express';

export function errorFallbackMiddleware(
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
) {
    console.error(error.stack);

    // File upload errors (multer) → 400
    if (error.message?.includes("File type") || error.message?.includes("File too large")) {
        response.status(400).json({ message: error.message, statusCode: 400 });
        return;
    }

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
