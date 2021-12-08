export default {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 65
    }
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  testEnvironment: 'node'
};
