// Rate Limiter for Client-Side Protection
interface RateLimitStorage {
  [key: string]: {
    attempts: number;
    resetTime: number;
    isBlocked: boolean;
  };
}

class RateLimiter {
  private storage: RateLimitStorage = {};
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.storage).forEach(key => {
      if (this.storage[key].resetTime < now) {
        delete this.storage[key];
      }
    });
  }

  private generateKey(action: string, identifier: string): string {
    return `${action}:${identifier}`;
  }

  public isRateLimited(
    action: string,
    identifier: string,
    maxAttempts: number,
    windowMs: number
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const key = this.generateKey(action, identifier);
    const now = Date.now();
    const resetTime = now + windowMs;

    let record = this.storage[key];

    if (!record || record.resetTime < now) {
      // Create new record or reset expired one
      record = {
        attempts: 0,
        resetTime,
        isBlocked: false,
      };
      this.storage[key] = record;
    }

    if (record.isBlocked) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.resetTime,
      };
    }

    record.attempts++;

    if (record.attempts >= maxAttempts) {
      record.isBlocked = true;
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: record.resetTime,
      };
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.attempts,
      resetTime: record.resetTime,
    };
  }

  public getRemainingTime(action: string, identifier: string): number {
    const key = this.generateKey(action, identifier);
    const record = this.storage[key];
    
    if (!record) return 0;
    
    const now = Date.now();
    return Math.max(0, record.resetTime - now);
  }

  public reset(action: string, identifier: string): void {
    const key = this.generateKey(action, identifier);
    delete this.storage[key];
  }

  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Rate limiting hooks for React
export const useRateLimit = (action: string, identifier: string) => {
  const checkRateLimit = (maxAttempts: number, windowMs: number) => {
    return rateLimiter.isRateLimited(action, identifier, maxAttempts, windowMs);
  };

  const getRemainingTime = () => {
    return rateLimiter.getRemainingTime(action, identifier);
  };

  const reset = () => {
    rateLimiter.reset(action, identifier);
  };

  return {
    checkRateLimit,
    getRemainingTime,
    reset,
  };
};

// Login rate limiting hook
export const useLoginRateLimit = (email: string) => {
  return useRateLimit('login', email);
};

// API rate limiting hook
export const useApiRateLimit = () => {
  return useRateLimit('api', 'global');
};
