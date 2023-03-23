// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

import type { Config } from '@jest/types';

const config: Partial<Config.ConfigGlobals> = {
    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: false,

    testEnvironment: 'jsdom',

    // An array of glob patterns indicating a set of files for which coverage information should be collected
    collectCoverageFrom: [
        'src/**/*.{js,ts,tsx}',
        '!src/index.ts',
    ],

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // A list of reporter names that Jest uses when writing coverage reports
    coverageReporters: [
        'cobertura',
        'lcov',
        'text',
    ],

    coverageThreshold: {
        global: {
            branches: 80,
            functions: 90,
            lines: 90,
            statements: 90,
        },
    },

    // An array of directory names to be searched recursively up from the requiring module's location
    moduleDirectories: [
        'src',
        'node_modules',
    ],

    // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
    moduleNameMapper: {
        '^.+\\.(css|scss|less|scss)$': '<rootDir>src/__mocks__/fileMock.js',
        '^.+\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>src/__mocks__/fileMock.js',
    } as unknown as Config.ProjectConfig['moduleNameMapper'],

    // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
    testPathIgnorePatterns: [
        '/node_modules/',
    ],
};

export default config;
