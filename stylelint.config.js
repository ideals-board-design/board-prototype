/**
 * Stylelint — design-system guardrails only.
 *
 * Intentionally minimal: we do NOT extend stylelint-config-standard, because
 * its strict selector/`composes:`/`:global()` rules fight CSS-Modules syntax
 * used across this repo. We enforce exactly two design-system rules:
 *
 *  1. No `var(--x)` referencing a token that isn't defined in the token files
 *     (catches the silent-fallback bug class, e.g. the `--text-2xl` / `--color-bg-primary` regressions).
 *     Component-scoped custom properties defined in the same file are recognised automatically.
 *  2. No hardcoded colours — colour must come from a semantic token.
 */
export default {
  plugins: [
    'stylelint-value-no-unknown-custom-properties',
    'stylelint-declaration-strict-value',
  ],
  rules: {
    'csstools/value-no-unknown-custom-properties': [true, {
      importFrom: ['src/styles/tokens.css', 'src/styles/aliases.css'],
    }],
    'scale-unlimited/declaration-strict-value': [
      ['color', 'background-color', 'border-color', 'fill'],
      {
        ignoreValues: ['inherit', 'transparent', 'currentColor', 'none', 'unset', 'initial'],
        message: 'Use a semantic colour token, e.g. var(--color-text-primary) (no hardcoded colours)',
      },
    ],
  },
  // These files DEFINE the raw token values — exempt them.
  ignoreFiles: ['src/styles/tokens.css', 'src/styles/aliases.css'],
}
