import { HTTP_STATUS } from './http-status.ts';

export class AppError extends Error {
    public error: string;
    public errors?: { field: string; message: string }[];
    public statusCode: number;

    constructor(
        statusCode: number,
        message: string,
        errors?: { field: string; message: string }[],
    ) {
        super(message);
        this.name = 'AppError';
        this.error = HTTP_STATUS[statusCode] ?? 'Unknown Error';
        this.errors = errors;
        this.statusCode = statusCode;
    }
}
