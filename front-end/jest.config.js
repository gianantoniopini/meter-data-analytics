module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: ['./src/**', '!**/__tests__/**'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      lines: 1
    }
  },
  preset: '@vue/cli-plugin-unit-jest/presets/typescript-and-babel',
  transform: {
    '^.+\\.vue$': 'vue-jest'
  }
};
