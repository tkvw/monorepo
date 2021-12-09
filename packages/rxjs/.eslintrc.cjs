module.exports = {
  extends: ['@tkvw/eslint-config/profiles/node'],
  parserOptions: { tsconfigRootDir: __dirname },
  rules: {
    'sort-imports': [
      'error',
      {
        ignoreCase: false,
        ignoreDeclarationSort: false,
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ['none', 'all', 'multiple', 'single'],
        allowSeparatedGroups: false
      }
    ]
  }
};