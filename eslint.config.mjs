// ESLint setup: catches real mistakes (undefined names, unreachable code, duplicate keys).
// Formatting is Prettier's job (see .prettierrc.json), so style rules are switched off here.
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'research/**',
      'mockups/**',
      'mods/**',
      'packs/**',
      'build/**',
      'worker/.wrangler/**',
      'bot/node_modules/**',
    ],
  },
  js.configs.recommended,
  {
    rules: {
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-cond-assign': ['error', 'except-parens'],
    },
  },
  // The game: classic scripts that share one global, FW.
  {
    files: ['app/**/*.js', 'modkit/**/*.js'],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.browser,
        FW: 'writable',
        // node fallbacks used when the engine runs in tests and the bot
        module: 'readonly',
        require: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
      },
    },
  },
  {
    files: ['app/sw.js'],
    languageOptions: { globals: { ...globals.serviceworker } },
  },
  // Node: tests, tools, the desktop shell and the Discord bot.
  {
    files: ['tests/**/*.js', 'scripts/**/*.js', 'electron/**/*.js', 'bot/**/*.js'],
    languageOptions: { sourceType: 'commonjs', globals: { ...globals.node, ...globals.browser, FW: 'writable' } },
  },
  // The Cloudflare world counter.
  {
    files: ['worker/**/*.js'],
    languageOptions: { sourceType: 'module', globals: { ...globals.serviceworker } },
  },
  prettier,
];
