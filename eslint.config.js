import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Base JS recommended rules
  js.configs.recommended,

  // React plugin flat config recommended
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime'],

  // Apply to all JS/JSX source files
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      // React hooks (set-state-in-effect is new in v7; downgrade to warn for
      // existing intentional reset-on-prop-change patterns in this codebase)
      ...reactHooksPlugin.configs.recommended.rules,
      'react-hooks/set-state-in-effect': 'warn',

      // Prettier formatting as ESLint errors
      'prettier/prettier': 'error',

      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prefer-stateless-function': 'error',
      'react/button-has-type': 'error',
      'react/no-unused-prop-types': 'error',
      'react/jsx-pascal-case': 'error',
      'react/jsx-no-script-url': 'error',
      'react/no-children-prop': 'error',
      'react/no-danger': 'error',
      'react/no-danger-with-children': 'error',
      'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
      'react/jsx-fragments': 'error',
      'react/destructuring-assignment': [
        'error',
        'always',
        { destructureInSignature: 'always' },
      ],
      'react/jsx-no-leaked-render': ['warn', { validStrategies: ['ternary'] }],
      'react/jsx-max-depth': ['error', { max: 5 }],
      'react/function-component-definition': [
        'warn',
        { namedComponents: 'function-declaration' },
      ],
      'react/jsx-key': [
        'error',
        {
          checkFragmentShorthand: true,
          checkKeyMustBeforeSpread: true,
          warnOnDuplicates: true,
        },
      ],
      'react/jsx-no-useless-fragment': 'warn',
      'react/jsx-curly-brace-presence': 'warn',
      'react/no-typos': 'warn',
      'react/display-name': 'warn',
      'react/self-closing-comp': 'warn',
      'react/jsx-one-expression-per-line': 'off',
      'react/prop-types': 'off',
    },
  },

  // Prettier must be last — disables conflicting style rules
  prettierConfig,
];
