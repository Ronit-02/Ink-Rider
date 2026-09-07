import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-n'

export default [
  {
    ignores: ['node_modules/', 'coverage/'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: globals.node,
    },
    plugins: {
      import: importPlugin,
      n: nodePlugin,
    },
    settings: {
      'import/resolver': {
        node: { extensions: ['.js'] },
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-wrappers': 'error',
      'no-prototype-builtins': 'error',
      // Controllers intentionally map known failures to safe client responses;
      // a catch binding is only required when its detail is used safely.
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      'n/no-missing-require': 'error',
      'n/no-process-exit': 'error',
    },
  },
  {
    files: ['utils/safe-url.js'],
    rules: {
      // This validator intentionally rejects ASCII control characters in URLs.
      'no-control-regex': 'off',
    },
  },
]
