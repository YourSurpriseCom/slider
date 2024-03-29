module.exports = {
    extends: [
        'eslint:recommended',
        'airbnb-typescript',
        'airbnb/hooks',
        'plugin:import/recommended',
    ],
    rules: {
        'react/jsx-indent': ['error', 4],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-props-no-spreading': ['error', { custom: 'ignore' }],
        'react/prop-types': 'off',
        'react/require-default-props': 'off',
        'indent': ['error', 4, { SwitchCase: 1 }],
        '@typescript-eslint/indent': ['error', 4],
        '@typescript-eslint/no-unused-expressions': ['error', { allowTernary: true }],
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: [
                    './Index.tsx',
                    '**/*.test.*',
                    '**/test/*.spec.*',
                    '**/playwright.config.ts*',
                    '**/rollup.config.js*',
                    '**/babel.config.cjs*',
                    '**/jest.config.js*',
                    '**/[mM]ock[s?]/**'
                ]
            }
        ],

    },
    plugins: ['react', "testing-library"],
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
};
