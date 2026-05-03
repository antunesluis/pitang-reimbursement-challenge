import dayjs from 'dayjs';

export function formatDate(date: Date | string | undefined): string {
    return dayjs(date).format('YYYY-MM-DD');
}

export function formatDateTime(date: Date | string | undefined): string {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
}

export function now(): string {
    return dayjs().toISOString();
}
