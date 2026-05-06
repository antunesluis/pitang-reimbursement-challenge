import { AppError } from '../lib/errors.ts';

import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type ValidationSchemas = {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                throw new AppError(
                    400,
                    'Validation error',
                    result.error.issues.map((issue) => ({
                        field: issue.path.map(String).join('.'),
                        message: issue.message,
                    })),
                );
            }
            req.params = result.data as Record<string, string>;
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                throw new AppError(
                    400,
                    'Validation error',
                    result.error.issues.map((issue) => ({
                        field: issue.path.map(String).join('.'),
                        message: issue.message,
                    })),
                );
            }
            req.validatedQuery = result.data as Record<string, unknown>;
        }

        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                throw new AppError(
                    400,
                    'Validation error',
                    result.error.issues.map((issue) => ({
                        field: issue.path.map(String).join('.'),
                        message: issue.message,
                    })),
                );
            }
            req.body = result.data;
        }

        next();
    };
}
