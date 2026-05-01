import { ZodError } from 'zod';

import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

type ValidationSchemas = {
    body?: ZodSchema;
    params?: ZodSchema;
    query?: ZodSchema;
};

export function validate(schemas: ValidationSchemas) {
    return (req: Request, res: Response, next: NextFunction) => {
        if (schemas.params) {
            const result = schemas.params.safeParse(req.params);
            if (!result.success) {
                res.status(400).json(formatZodError(result.error));
                return;
            }
            req.params = result.data as Record<string, string>;
        }

        if (schemas.query) {
            const result = schemas.query.safeParse(req.query);
            if (!result.success) {
                res.status(400).json(formatZodError(result.error));
                return;
            }
            req.query = result.data as Record<
                string,
                string | string[] | undefined
            >;
        }

        if (schemas.body) {
            const result = schemas.body.safeParse(req.body);
            if (!result.success) {
                res.status(400).json(formatZodError(result.error));
                return;
            }
            req.body = result.data;
        }

        next();
    };
}

function formatZodError(error: ZodError) {
    return {
        errors: error.issues.map((issue) => ({
            field: issue.path.map(String).join('.'),
            message: issue.message,
        })),
        message: 'Validation error',
        statusCode: 400,
    };
}
