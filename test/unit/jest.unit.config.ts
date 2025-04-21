module.exports = {
    rootDir: '../../',
    roots: ['<rootDir>/src', '<rootDir>/test/unit'],

    moduleFileExtensions: ['js', 'json', 'ts'],
    moduleDirectories: ['node_modules', 'src'],

    testMatch: ['**/*.spec.ts'],
    transform: {
        '^.+\\.(ts|js)$': [
            '@swc/jest',
            {
                sourceMaps: 'inline',
            },
        ],
    },

    collectCoverageFrom: [
        /*******************************************
         *                 COLLECT                 *
         *******************************************/

        'src/**/*.{ts,js}',

        /*******************************************
         *              DON'T COLLECT              *
         *******************************************/
        '!src/main.{ts,js}',
        '!src/app.setup.{ts,js}',

        // Nothing to test in modules
        '!src/**/*.module.{ts,js}',

        // Integration test instead
        '!src/**/*.dto.{ts,js}',
        '!src/common/decorators/dto/**',
        '!src/common/decorators/loggers/**',

        // Ignore Configs (no business logic)
        '!src/**/*.config.{ts,js}',

        // Addapter connection logic should be integration tested
        '!src/**/*.connection.{ts,js}',

        // Ignore types (no behavior)
        '!src/**/*.enums.{ts,js}',
        '!src/**/*.model.{ts,js}',
        '!src/**/*.types.{ts,js}',
        '!src/**/*.constants.{ts,js}',
        '!src/**/*.tokens.{ts,js}',
        '!src/**/*.strategy.{ts,js}',
    ],
    testPathIgnorePatterns: ['.*\\.module\\.(ts|js)$', '.*\\.d\\.(ts|js)$'],

    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },

    coverageThreshold: {
        global: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },

    testEnvironment: 'node',
};
