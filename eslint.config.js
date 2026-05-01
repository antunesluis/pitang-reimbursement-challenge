import perfectionist from 'eslint-plugin-perfectionist';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
    {
        ignores: [
            '**/dist/**',
            '**/node_modules/**',
            '**/*.tgz',
            '**/out/**',
            '**/generated/**',
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            perfectionist,
        },
        languageOptions: {
            ecmaVersion: 'latest',
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            '@typescript-eslint/no-namespace': [
                'error',
                { allowDeclarations: true },
            ],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
            ],
            'perfectionist/sort-imports': [
                'error',
                {
                    groups: [
                        'side-effect',
                        'builtin',
                        'external',
                        'internal',
                        ['parent', 'sibling', 'index'],
                        'type',
                        'style',
                        'unknown',
                    ],
                    internalPattern: ['^@/'],
                    newlinesBetween: 1,
                    order: 'asc',
                    type: 'natural',
                },
            ],
            'perfectionist/sort-named-imports': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-named-exports': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-exports': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-objects': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-interfaces': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-union-types': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-intersection-types': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-classes': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'perfectionist/sort-maps': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
        },
    },

    // Backend
    {
        files: ['packages/backend/**/*.ts'],
        languageOptions: {
            globals: globals.node,
        },
    },

    // Frontend
    {
        files: ['packages/frontend/**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        languageOptions: {
            globals: globals.browser,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'perfectionist/sort-jsx-props': [
                'error',
                { order: 'asc', type: 'natural' },
            ],
            'react-refresh/only-export-components': 'warn',
        },
    },

    // JS config files
    {
        files: ['**/*.{js,cjs,mjs}'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
);
