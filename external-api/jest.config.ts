export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 85
    }
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  testEnvironment: 'node'
};
