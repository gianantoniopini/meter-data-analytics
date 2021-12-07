import { defaults as tsjPreset } from 'ts-jest/presets';

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
  preset: '@shelf/jest-mongodb',
  roots: ['<rootDir>/src'],
  setupFiles: ['./jest.setup.ts'],
  transform: tsjPreset.transform
};
