import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

/**
 * ESLint — lean, design-system-focused config.
 *
 * Deliberately minimal so introducing linting to a previously-unlinted
 * codebase doesn't drown the signal. We use the typescript-eslint *base*
 * (parser + plugin, no opinionated rule set) and enable only:
 *
 *  - The icon mandate (error): icons & illustrations render as SVG strings via
 *    dangerouslySetInnerHTML from src/icons / src/illustrations — never inline <svg> JSX.
 *  - React Hooks correctness (rules-of-hooks error, exhaustive-deps warn).
 *
 * To grow coverage later, add rules below or layer in tseslint.configs.recommended.
 */
export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.vite', 'scripts', '*.config.js', 'vite.config.ts'] },

  tseslint.configs.base,

  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser },
    },
    rules: {
      // ── Icon mandate ──────────────────────────────────────────────
      'no-restricted-syntax': ['error', {
        selector: "JSXOpeningElement[name.name='svg']",
        message:
          'Render icons/illustrations as SVG strings via dangerouslySetInnerHTML from src/icons or src/illustrations — no inline <svg> JSX.',
      }],

      // ── React Hooks (plugin registered manually — its shareable flat
      //    config still ships legacy array-style plugins) ──
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // ── Scaffold for future deprecations (article: "make it a lint error") ──
      // When a path/component is deprecated, add a pattern here so agents get
      // a hard error pointing at the replacement. No legacy module exists today.
      // 'no-restricted-imports': ['error', { patterns: [{ group: ['…'], message: '…' }] }],
    },
  },
)
