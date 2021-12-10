export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 75
    }
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts']
};
