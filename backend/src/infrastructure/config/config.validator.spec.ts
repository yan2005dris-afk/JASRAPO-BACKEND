import { randomBytes } from 'crypto';
import {
  assertAllSecrets,
  assertJwtSecret,
  CRYPTO_SECRET_KEYS,
  InsecureSecretError,
  InsecureSecretsAggregateError,
  shannonEntropy,
} from './config.validator';

describe('config.validator', () => {
  const STRONG_HEX_SECRET = randomBytes(64).toString('hex');

  describe('shannonEntropy', () => {
    it('returns 0 for an empty string', () => {
      expect(shannonEntropy('')).toBe(0);
    });

    it('returns 0 for a single-character string', () => {
      expect(shannonEntropy('a')).toBe(0);
    });

    it('returns 1 for a two-symbol uniform distribution', () => {
      expect(shannonEntropy('ab')).toBeCloseTo(1, 10);
    });

    it('returns log2(n) for n uniformly distributed symbols', () => {
      const alphabet = 'abcdefgh';
      const input = alphabet.repeat(4);
      expect(shannonEntropy(input)).toBeCloseTo(Math.log2(8), 10);
    });

    it('returns 0 for a constant string', () => {
      expect(shannonEntropy('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toBe(0);
    });
  });

  describe('assertJwtSecret', () => {
    it('throws when the secret is undefined', () => {
      expect(() => assertJwtSecret(undefined, 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
    });

    it('throws when the secret is the empty string', () => {
      expect(() => assertJwtSecret('', 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
    });

    it('throws when the secret is shorter than 32 bytes', () => {
      expect(() => assertJwtSecret('short', 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
      expect(() => assertJwtSecret('short', 'TEST_SECRET')).toThrow(/short/);
    });

    it('throws when the secret matches a known default ("super_secret")', () => {
      expect(() => assertJwtSecret('super_secret', 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
    });

    it('throws when the secret matches "access_super_secret_key" (the legacy .env.example default)', () => {
      expect(() =>
        assertJwtSecret('access_super_secret_key', 'JWT_ACCESS_SECRET'),
      ).toThrow(InsecureSecretError);
    });

    it('throws when the secret matches "refresh_super_secret_key"', () => {
      expect(() =>
        assertJwtSecret('refresh_super_secret_key', 'JWT_REFRESH_SECRET'),
      ).toThrow(InsecureSecretError);
    });

    it('throws when the secret matches the .env.example placeholder sentinel', () => {
      expect(() =>
        assertJwtSecret('__your_secret_here__', 'JWT_ACCESS_SECRET'),
      ).toThrow(InsecureSecretError);
    });

    it('throws when the secret is a long but low-entropy repeated character string', () => {
      const lowEntropy = 'a'.repeat(40);
      expect(() => assertJwtSecret(lowEntropy, 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
      expect(() => assertJwtSecret(lowEntropy, 'TEST_SECRET')).toThrow(
        /entropy/i,
      );
    });

    it('throws when the secret is a long but low-entropy short-alphabet string', () => {
      const lowEntropy = 'abababababababababababababababababababab';
      expect(lowEntropy.length).toBeGreaterThanOrEqual(32);
      expect(() => assertJwtSecret(lowEntropy, 'TEST_SECRET')).toThrow(
        InsecureSecretError,
      );
    });

    it('accepts a 32-byte random hex secret', () => {
      expect(() =>
        assertJwtSecret(STRONG_HEX_SECRET, 'TEST_SECRET'),
      ).not.toThrow();
    });

    it('accepts a 64-character random hex secret', () => {
      expect(() =>
        assertJwtSecret(randomBytes(64).toString('hex'), 'TEST_SECRET'),
      ).not.toThrow();
    });

    it('accepts a random base64 secret of >= 32 bytes', () => {
      const b64 = randomBytes(64).toString('base64');
      expect(() => assertJwtSecret(b64, 'TEST_SECRET')).not.toThrow();
    });

    it('includes the secret name in the error message', () => {
      expect(() => assertJwtSecret(undefined, 'JWT_ACCESS_SECRET')).toThrow(
        /JWT_ACCESS_SECRET/,
      );
    });

    it('includes the openssl remediation hint in the error message', () => {
      try {
        assertJwtSecret('short', 'JWT_ACCESS_SECRET');
        fail('expected assertJwtSecret to throw');
      } catch (err) {
        expect(err).toBeInstanceOf(InsecureSecretError);
        expect((err as Error).message).toContain('openssl rand -hex 32');
      }
    });
  });

  describe('assertAllSecrets', () => {
    const ORIGINAL_ENV = process.env;

    beforeEach(() => {
      process.env = { ...ORIGINAL_ENV };
    });

    afterAll(() => {
      process.env = ORIGINAL_ENV;
    });

    it('passes when every required secret is a strong random value', () => {
      process.env.JWT_ACCESS_SECRET = randomBytes(64).toString('hex');
      process.env.JWT_REFRESH_SECRET = randomBytes(64).toString('hex');
      process.env.ENCRYPTION_KEY = randomBytes(64).toString('hex');

      expect(() => assertAllSecrets()).not.toThrow();
    });

    it('aggregates multiple failures into a single error', () => {
      process.env.JWT_ACCESS_SECRET = 'short';
      process.env.JWT_REFRESH_SECRET = 'super_secret';
      process.env.ENCRYPTION_KEY = undefined;

      let captured: unknown;
      try {
        assertAllSecrets();
      } catch (err) {
        captured = err;
      }

      expect(captured).toBeInstanceOf(InsecureSecretsAggregateError);
      const aggregate = captured as InsecureSecretsAggregateError;
      expect(aggregate.failures).toHaveLength(3);
      expect(aggregate.failures.map((f) => f.secretName).sort()).toEqual(
        [...CRYPTO_SECRET_KEYS].sort(),
      );
      expect(aggregate.message).toContain('openssl rand -hex 32');
      expect(aggregate.message).toContain('JWT_ACCESS_SECRET');
      expect(aggregate.message).toContain('JWT_REFRESH_SECRET');
      expect(aggregate.message).toContain('ENCRYPTION_KEY');
    });

    it('throws a single InsecureSecretError wrapped in aggregate when only one secret fails', () => {
      process.env.JWT_ACCESS_SECRET = randomBytes(64).toString('hex');
      process.env.JWT_REFRESH_SECRET = 'super_secret';
      process.env.ENCRYPTION_KEY = randomBytes(64).toString('hex');

      let captured: unknown;
      try {
        assertAllSecrets();
      } catch (err) {
        captured = err;
      }

      expect(captured).toBeInstanceOf(InsecureSecretsAggregateError);
      const aggregate = captured as InsecureSecretsAggregateError;
      expect(aggregate.failures).toHaveLength(1);
      expect(aggregate.failures[0].secretName).toBe('JWT_REFRESH_SECRET');
    });
  });
});
