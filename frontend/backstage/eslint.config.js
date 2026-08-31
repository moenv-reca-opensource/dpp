import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['src/**/*.{ts,vue}'],
    languageOptions: { globals: globals.browser }
  },
  {
    files: ['*.config.{js,ts}', 'scripts/**/*.mjs'],
    languageOptions: { globals: globals.node }
  },
  eslintConfigPrettier,
  {
    files: ['**/*.{js,mjs,ts,vue}'],
    rules: {
      semi: ['error', 'never'],
      'comma-dangle': ['error', 'never']
    }
  },
  {
    files: ['**/*.{js,mjs,ts}'],
    rules: {
      'max-len': ['error', { code: 100 }]
    }
  },
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/attribute-hyphenation': ['error', 'always'],
      'vue/max-len': ['error', { code: 100, template: 100 }]
    }
  }
)
