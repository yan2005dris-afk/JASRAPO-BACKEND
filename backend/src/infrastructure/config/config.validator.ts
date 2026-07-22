const MIN_SECRET_BYTES = 32;
const MIN_SHANNON_ENTROPY_BITS_PER_CHAR = 3.5;

const FORBIDDEN_DEFAULT_SECRETS: ReadonlySet<string> = new Set([
  'super_secret',
  'password',
  'changeme',
  'change_me',
  'access_super_secret_key',
  'refresh_super_secret_key',
  'secret',
  '12345678',
  'admin',
]);

const FORBIDDEN_PLACEHOLDER_SENTINELS: ReadonlySet<string> = new Set([
  '__SET_VIA_OPENSSL_RAND_HEX_32__',
  'changeme',
  'CHANGE_ME',
]);

export const CRYPTO_SECRET_KEYS = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
] as const;

export type CryptoSecretKey = (typeof CRYPTO_SECRET_KEYS)[number];

export class InsecureSecretError extends Error {
  constructor(
    public readonly secretName: string,
    public readonly reason: string,
  ) {
    super(
      `[${secretName}] ${reason}. Generate a strong secret with: openssl rand -hex 32`,
    );
    this.name = 'InsecureSecretError';
  }
}

export class InsecureSecretsAggregateError extends Error {
  constructor(public readonly failures: ReadonlyArray<InsecureSecretError>) {
    const header = `Refusing to start: ${failures.length} insecure secret(s) detected.`;
    const body = failures.map((f) => `  - ${f.message}`).join('\n');
    const footer = `Generate strong secrets with: openssl rand -hex 32`;
    super(`${header}\n${body}\n${footer}`);
    this.name = 'InsecureSecretsAggregateError';
  }
}

export function shannonEntropy(value: string): number {
  if (value.length === 0) {
    return 0;
  }
  const counts = new Map<string, number>();
  for (const ch of value) {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  const length = value.length;
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / length;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function assertJwtSecret(
  secret: string | undefined,
  name: string,
): asserts secret is string {
  if (secret === undefined || secret === null || secret === '') {
    throw new InsecureSecretError(name, 'is missing or empty');
  }
  if (typeof secret !== 'string') {
    throw new InsecureSecretError(name, 'must be a string');
  }
  const byteLength = Buffer.byteLength(secret, 'utf8');
  if (byteLength < MIN_SECRET_BYTES) {
    throw new InsecureSecretError(
      name,
      `is too short (${byteLength} bytes, minimum ${MIN_SECRET_BYTES})`,
    );
  }
  if (FORBIDDEN_DEFAULT_SECRETS.has(secret)) {
    throw new InsecureSecretError(name, 'matches a known default placeholder');
  }
  if (FORBIDDEN_PLACEHOLDER_SENTINELS.has(secret)) {
    throw new InsecureSecretError(
      name,
      'is still set to the .env.example placeholder sentinel',
    );
  }
  const entropy = shannonEntropy(secret);
  if (entropy < MIN_SHANNON_ENTROPY_BITS_PER_CHAR) {
    throw new InsecureSecretError(
      name,
      `has low Shannon entropy (${entropy.toFixed(2)} bits/char, minimum ${MIN_SHANNON_ENTROPY_BITS_PER_CHAR})`,
    );
  }
}

export function assertAllSecrets(): void {
  const failures: InsecureSecretError[] = [];
  for (const key of CRYPTO_SECRET_KEYS) {
    const value = process.env[key];
    try {
      assertJwtSecret(value, key);
    } catch (err) {
      if (err instanceof InsecureSecretError) {
        failures.push(err);
      } else {
        throw err;
      }
    }
  }
  if (failures.length > 0) {
    throw new InsecureSecretsAggregateError(failures);
  }
}
