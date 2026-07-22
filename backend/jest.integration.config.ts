import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Config } from 'jest';

const packageDirectory = existsSync(join(process.cwd(), 'backend/package.json'))
  ? join(process.cwd(), 'backend')
  : process.cwd();
const packageJson = JSON.parse(
  readFileSync(join(packageDirectory, 'package.json'), 'utf8'),
) as { jest: Config };
const baseConfig = packageJson.jest;

const config: Config = {
  ...baseConfig,
  rootDir: '.',
  testRegex: 'test/integration/.*\\.int-spec\\.ts$',
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: 180_000,
  transform: {
    ...baseConfig.transform,
    '^.+\\.(t|j)s$': ['ts-jest', { useESM: false }],
  },
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '^src/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};

export default config;
