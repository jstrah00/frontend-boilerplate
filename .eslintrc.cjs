module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh', 'jsx-a11y'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  overrides: [
    {
      // shadcn/ui primitives are wrappers that receive children at usage,
      // and they co-export cva() variants (badgeVariants, buttonVariants)
      // alongside the component. jsx-a11y can't see through forwardRef +
      // spread props, and react-refresh's allowConstantExport doesn't
      // cover function-typed const exports.
      files: ['src/components/ui/**/*.{ts,tsx}'],
      rules: {
        'jsx-a11y/heading-has-content': 'off',
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      // theme-provider co-locates the provider component with its
      // useTheme hook (shadcn convention). Splitting them would force a
      // refactor across all consumers for no runtime benefit.
      files: ['src/components/theme-provider.tsx'],
      rules: {
        'react-refresh/only-export-components': 'off',
      },
    },
    {
      // Test files don't go through HMR and MSW handlers legitimately
      // need loose body types to mimic untyped JSON payloads.
      files: ['src/test/**/*.{ts,tsx}', 'src/**/__tests__/**/*.{ts,tsx}'],
      rules: {
        'react-refresh/only-export-components': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
}
