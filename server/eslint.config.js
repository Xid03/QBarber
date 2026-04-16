import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/*.js',
      'node_modules/**',
      'dist/**',
      '__tests__/**',
      'config/**',
      'controllers/**',
      'docs/**',
      'middleware/**',
      'models/**',
      'routes/**',
      'scripts/**',
      'services/**',
      'socket/**',
      'server.js'
    ]
  },
  eslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'prisma/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin
    },
    rules: {
      'no-undef': 'off',
      ...tseslint.configs['recommended-type-checked'].rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'import/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always'
        }
      ]
    }
  },
  prettier
];
