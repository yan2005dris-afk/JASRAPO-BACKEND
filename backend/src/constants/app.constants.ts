const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const TRUST_PROXY_HOPS = 1;
export const TRUST_PROXY_KEY = 'trust proxy' as const;

const parsedRedisSessionTtl = Number(process.env.REDIS_SESSION_TTL);

export const REDIS_SESSION_TTL_SECONDS = Number.isFinite(parsedRedisSessionTtl)
  ? parsedRedisSessionTtl
  : DEFAULT_SESSION_TTL_SECONDS;
