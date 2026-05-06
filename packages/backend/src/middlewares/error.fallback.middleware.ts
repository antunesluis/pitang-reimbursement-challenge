import { env } from '../lib/env.vars.ts';
import { AppError } from '../lib/errors.ts';

import type { NextFunction, Request, Response } from 'express';

export function errorFallbackMiddleware(
    error: Error,
    _request: Request,
    response: Response,
    _next: NextFunction,
) {
    console.error(error.stack);

    if (error instanceof AppError) {
        response.status(error.statusCode).json({
            error: error.error,
            errors: error.errors,
            message: error.message,
            statusCode: error.statusCode,
        });
        return;
    }

    if (
        error.message?.includes('File type') ||
        error.message?.includes('File too large')
    ) {
        response.status(400).json({
            error: 'Bad Request',
            message: error.message,
            statusCode: 400,
        });
        return;
    }

    const isDev = env.NODE_ENV === 'development';

    response.status(500).json({
        error: 'Internal Server Error',
        message: isDev ? error.message : 'Internal server error',
        statusCode: 500,
    });
}
