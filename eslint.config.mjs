import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: ['dist/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: {
      parser: vueParser,
      globals: {
        AbortController: 'readonly',
        AbortSignal: 'readonly',
        CustomEvent: 'readonly',
        Event: 'readonly',
        HTMLInputElement: 'readonly',
        HeadersInit: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        window: 'readonly',
      },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
  },
  {
    files: ['src/features/dashboard/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/auth/*', '@features/auth/*'],
              message: 'Dashboard feature must not import auth internals directly.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/auth/**/*.{ts,vue}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/dashboard/*', '@features/dashboard/*'],
              message: 'Auth feature must not import dashboard internals directly.',
            },
          ],
        },
      ],
    },
  },
]
