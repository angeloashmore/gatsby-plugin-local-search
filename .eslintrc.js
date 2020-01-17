module.exports = {
  rules: {
    'no-var': 'warn',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
  },
  parser: 'babel-eslint',
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 8,
  },
}
