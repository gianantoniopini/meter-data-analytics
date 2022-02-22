// eslint-disable-next-line unicorn/prefer-module
module.exports = {
  root: true,

  env: {
    node: true
  },

  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
    'plugin:jest/recommended',
    'plugin:jest-dom/recommended',
    'plugin:prettier/recommended',
    'plugin:sonarjs/recommended',
    'plugin:unicorn/recommended'
  ],

  parserOptions: {
    ecmaVersion: 2020
  },

  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
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
          props: true
        }
      }
    ]
  },

  overrides: [
    {
      files: ['**/__tests__/*.{j,t}s?(x)'],
      env: {
        jest: true
      }
    },
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
};
