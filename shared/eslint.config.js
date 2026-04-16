import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['index.js', 'dist/**', '**/*.d.ts', 'node_modules/**']
  },
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsParser
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-undef': 'off',
      ...tseslint.configs.recommended.rules
    }
  },
  prettier
];
