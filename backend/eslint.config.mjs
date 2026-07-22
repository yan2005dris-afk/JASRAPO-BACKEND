// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Ban `prisma.$executeRawUnsafe(...)` outside an explicit allowlist comment.
 *
 * Rationale: `$executeRawUnsafe` accepts a raw SQL string, which makes it
 * trivial to introduce SQL injection. Even when the SQL itself is currently
 * a static constant, we want a single parameterized path
 * (`$queryRaw(Prisma.sql\`...\`)` / `$executeRaw(Prisma.sql\`...\`)`) so that
 * a future caller cannot accidentally interpolate untrusted data into the
 * statement.
 *
 * Opt-out: place `// ALLOW_EXECUTE_RAW_UNSAFE: <reason>` on the line directly
 * above the call.
 */
const noUnsafeExecuteRawPlugin = {
  rules: {
    'no-unsafe-execute-raw': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Ban prisma.$executeRawUnsafe outside an ALLOW_EXECUTE_RAW_UNSAFE opt-out',
        },
        schema: [],
        messages: {
          banned:
            'Avoid prisma.$executeRawUnsafe. Use $queryRaw(Prisma.sql`...`) or $executeRaw(Prisma.sql`...`) so values are parameterized. Add "// ALLOW_EXECUTE_RAW_UNSAFE: <reason>" on the line above to opt out.',
        },
      },
      create(context) {
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        return {
          CallExpression(node) {
            const callee = node.callee;
            if (
              callee.type !== 'MemberExpression' ||
              callee.property.type !== 'Identifier' ||
              callee.property.name !== '$executeRawUnsafe' ||
              callee.object.type !== 'MemberExpression' ||
              callee.object.property.type !== 'Identifier' ||
              callee.object.property.name !== 'prisma'
            ) {
              return;
            }
            const targetLine = callee.loc.start.line;
            const getAllComments = () =>
              sourceCode.getAllComments
                ? sourceCode.getAllComments()
                : [];
            const allComments = getAllComments();
            const hasAllow = allComments.some(
              (c) =>
                c.type === 'Line' &&
                c.loc.end.line === targetLine - 1 &&
                c.value.includes('ALLOW_EXECUTE_RAW_UNSAFE:'),
            );
            if (!hasAllow) {
              context.report({ node: callee, messageId: 'banned' });
            }
          },
        };
      },
    },
  },
};

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      'coverage/**',
      'dist/**',
      'node_modules/**',
      'src/generated/**',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    plugins: {
      jasrapo: noUnsafeExecuteRawPlugin,
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
        // NestJS common
        Request: 'readonly',
        Response: 'readonly',
        Body: 'readonly',
        Param: 'readonly',
        Query: 'readonly',
        Headers: 'readonly',
        Session: 'readonly',
        Next: 'readonly',
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
      // Security
      'no-console': 'warn',
      'no-debugger': 'error',
      // Best practices
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
      'no-redeclare': 'off',
      'no-unused-expressions': 'error',
      'no-useless-catch': 'off',
      'no-empty': 'off',
      'jasrapo/no-unsafe-execute-raw': 'error',
    },
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['src/main.ts', 'src/infrastructure/**/*.ts'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'NewExpression[callee.name="Logger"]',
          message:
            'Use injected LoggerService instead of new Logger(). See issue #146.',
        },
      ],
    },
  },
  // Relaxed for test files
  {
    files: ['**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },
);
