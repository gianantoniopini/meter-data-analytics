/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-strongly-recommended',
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'unicorn/filename-case': [
      'error',
      {
        case: 'kebabCase'
      }
    ],
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          env: true,
          props: true
        }
      }
    ]
  },
  overrides: [
    {
      files: ['*.vue', '**/__tests__/**/*.{j,t}s?(x)'],
      rules: {
        'unicorn/filename-case': [
          'error',
          {
            case: 'pascalCase'
          }
        ]
      }
    }
  ]
}
