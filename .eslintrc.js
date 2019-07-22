module.exports = {
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
  ],
  overrides: {
    files: ['**/*.ts'],
    parser: '@typescript-eslint/parser',
    rules: {
      'no-undef': 'off',
    },
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
  },
  plugins: [
    '@typescript-eslint',
    'sort-destructure-keys',
    'typescript-sort-keys',
  ],
  root: true,
  rules: {
    'arrow-body-style': ['off'],
    'arrow-parens': ['error', 'always'],
    'dot-notation': ['error', { allowPattern: '^[^_]*([_]{2}).+' }],
    'global-require': ['off'],
    'import/no-dynamic-require': ['off'],
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: true,
    }],
    'import/no-unresolved': ['off'],
    'import/order': ['off'],
    'import/prefer-default-export': ['off'],
    'lines-between-class-members': ['off'],
    'no-await-in-loop': ['off'],
    'no-underscore-dangle': ['off'],
    'no-use-before-define': ['error', {
      functions: false,
    }],
    'object-curly-newline': ['off'],
    'prefer-template': ['off'],
    quotes: [
      'error',
      'single',
      {
        allowTemplateLiterals: true,
      }],
    'sort-destructure-keys/sort-destructure-keys': 2,
    'sort-keys': ['error'],
    'typescript-sort-keys/interface': 2,
    'typescript-sort-keys/string-enum': 2,
    'wrap-iife': ['error', 'inside'],
  },
};
