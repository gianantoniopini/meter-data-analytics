// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    './src/**',
    '!**/assets/**',
    '!**/__tests__/**',
    '!**/i18n/locales/**'
  ],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 91
    }
  },
  moduleNameMapper: {
    '@shared/(.*)': '<rootDir>/../shared/src/$1'
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  testMatch: ['**/__tests__/**/*.Test.ts'],
  transformIgnorePatterns: ['/node_modules/(?!lodash-es)']
};
