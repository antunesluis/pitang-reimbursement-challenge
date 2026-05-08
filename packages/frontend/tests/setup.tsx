import '@testing-library/jest-dom';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'bun:test';

const originalError = console.error;
console.error = (...rest: unknown[]) => {
    const first = typeof rest[0] === 'string' ? rest[0] : '';
    if (first.includes('was not wrapped in act')) return;
    originalError.call(console, ...rest);
};

afterEach(() => {
    cleanup();
});
