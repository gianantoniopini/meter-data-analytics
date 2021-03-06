export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!**/__tests__/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 82
    }
  },
  moduleNameMapper: {
    '@shared/(.*)': '<rootDir>/../shared/src/$1'
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts']
};
