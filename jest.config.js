module.exports = {
    preset: 'react-native',
    transform: {
        '\\.[jt]sx?$': 'babel-jest',
    },
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/unit/mocks/', '<rootDir>/tests/e2e/'],
    testMatch: ['**/tests/unit/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
    globals: {
        __DEV__: true,
        WebSocket: {},
    },
    timers: 'fake',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jestSetup.js'],
};
