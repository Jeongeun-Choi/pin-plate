interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  key: string;
  limit: number;
  now: number;
  windowMs: number;
}

export interface RateLimitResult {
  isAllowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

const rateLimitBuckets = new Map<string, RateLimitBucket>();

const pruneExpiredBuckets = (now: number): void => {
  if (rateLimitBuckets.size < 1_000) return;

  rateLimitBuckets.forEach((bucket, key) => {
    if (now > bucket.resetAt) {
      rateLimitBuckets.delete(key);
    }
  });
};

export const checkRateLimit = ({
  key,
  limit,
  now,
  windowMs,
}: RateLimitOptions): RateLimitResult => {
  pruneExpiredBuckets(now);

  const currentBucket = rateLimitBuckets.get(key);

  if (!currentBucket || now > currentBucket.resetAt) {
    const resetAt = now + windowMs;
    rateLimitBuckets.set(key, { count: 1, resetAt });

    return {
      isAllowed: true,
      limit,
      remaining: limit - 1,
      resetAt,
    };
  }

  if (currentBucket.count >= limit) {
    return {
      isAllowed: false,
      limit,
      remaining: 0,
      resetAt: currentBucket.resetAt,
    };
  }

  currentBucket.count += 1;

  return {
    isAllowed: true,
    limit,
    remaining: limit - currentBucket.count,
    resetAt: currentBucket.resetAt,
  };
};
