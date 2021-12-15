require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  env: {
    node: true
  },
  extends: ['@rushstack/eslint-config/profile/node.js'],
  plugins: ['simple-import-sort'],
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
};
