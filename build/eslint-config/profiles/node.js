require('@rushstack/eslint-config/patch/modern-module-resolution');

module.exports = {
  env: {
    node: true,
  },
  extends: ['@rushstack/eslint-config/profile/node.js'],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off"
  },
};
