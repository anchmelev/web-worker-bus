module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  extends: ['airbnb-typescript/base', 'plugin:@typescript-eslint/recommended'],
  rules: {
    'import/extensions': ['off'],
    'import/no-extraneous-dependencies': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
  },
};
