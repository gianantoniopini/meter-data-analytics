module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!**/__tests__/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 54
    }
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.ts'],
  transform: {
    '^.+\\.vue$': 'vue-jest'
  }
};
