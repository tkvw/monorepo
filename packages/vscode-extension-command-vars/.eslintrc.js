module.exports = {
  extends: ['@tkvw/eslint-config/profiles/node'],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off"
  },
  parserOptions: { tsconfigRootDir: __dirname },
  
};
