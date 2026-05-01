// Health Check System for CRM PMG
// Prevents runtime errors and ensures all modules are properly loaded

interface HealthCheckResult {
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
}

class HealthChecker {
  private checks: Map<string, () => HealthCheckResult> = new Map();
  private isInitialized = false;

  constructor() {
    this.registerDefaultChecks();
  }

  private registerDefaultChecks() {
    // Check if React is available
    this.addCheck('react', () => {
      try {
        if (typeof require !== 'undefined') {
          const React = require('react');
          if (React && typeof React.createElement === 'function') {
            return { status: 'healthy', message: 'React loaded successfully' };
          }
        }
        return { status: 'error', message: 'React not available' };
      } catch {
        return { status: 'error', message: 'Failed to load React' };
      }
    });

    // Check if React DOM is available
    this.addCheck('react-dom', () => {
      try {
        if (typeof require !== 'undefined') {
          const ReactDOM = require('react-dom/client');
          if (ReactDOM && typeof ReactDOM.createRoot === 'function') {
            return { status: 'healthy', message: 'React DOM loaded successfully' };
          }
        }
        return { status: 'error', message: 'React DOM not available' };
      } catch {
        return { status: 'error', message: 'Failed to load React DOM' };
      }
    });

    // Check if security modules are available
    this.addCheck('security-modules', () => {
      try {
        const securityConfig = require('../security/securityConfig');
        const rateLimiter = require('../utils/rateLimiter');
        
        if (securityConfig && rateLimiter) {
          return { status: 'healthy', message: 'Security modules loaded successfully' };
        }
        return { status: 'warning', message: 'Security modules partially loaded' };
      } catch {
        return { status: 'warning', message: 'Security modules not available (running in production)' };
      }
    });

    // Check if auth modules are available
    this.addCheck('auth-modules', () => {
      try {
        const useAuth = require('../hooks/useAuth');
        if (useAuth && useAuth.AuthProvider) {
          return { status: 'healthy', message: 'Auth modules loaded successfully' };
        }
        return { status: 'error', message: 'Auth modules not properly loaded' };
      } catch {
        return { status: 'error', message: 'Failed to load auth modules' };
      }
    });

    // Check if router is available
    this.addCheck('router', () => {
      try {
        const reactRouterDom = require('react-router-dom');
        if (reactRouterDom && reactRouterDom.BrowserRouter) {
          return { status: 'healthy', message: 'Router loaded successfully' };
        }
        return { status: 'error', message: 'Router not available' };
      } catch {
        return { status: 'error', message: 'Failed to load router' };
      }
    });
  }

  public addCheck(name: string, checkFn: () => HealthCheckResult) {
    this.checks.set(name, checkFn);
  }

  public async runCheck(name: string): Promise<HealthCheckResult> {
    const check = this.checks.get(name);
    if (!check) {
      return { status: 'error', message: `Check '${name}' not found` };
    }

    try {
      return check();
    } catch (error) {
      return { 
        status: 'error', 
        message: `Check '${name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }

  public async runAllChecks(): Promise<Map<string, HealthCheckResult>> {
    const results = new Map<string, HealthCheckResult>();
    
    // Convert Map entries to array for compatibility
    const entries = Array.from(this.checks.entries());
    for (const [name] of entries) {
      const result = await this.runCheck(name);
      results.set(name, result);
    }

    return results;
  }

  public async getOverallHealth(): Promise<HealthCheckResult> {
    const results = await this.runAllChecks();
    const errors = Array.from(results.values()).filter(r => r.status === 'error');
    const warnings = Array.from(results.values()).filter(r => r.status === 'warning');

    if (errors.length > 0) {
      return {
        status: 'error',
        message: `Application has ${errors.length} error(s) and ${warnings.length} warning(s)`,
        details: Object.fromEntries(results)
      };
    }

    if (warnings.length > 0) {
      return {
        status: 'warning',
        message: `Application has ${warnings.length} warning(s)`,
        details: Object.fromEntries(results)
      };
    }

    return {
      status: 'healthy',
      message: 'All systems operational',
      details: Object.fromEntries(results)
    };
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    const health = await this.getOverallHealth();
    
    if (health.status === 'error') {
      console.error('Health check failed:', health.message);
      if (health.details) {
        Object.entries(health.details).forEach(([name, result]) => {
          const healthResult = result as HealthCheckResult;
          if (healthResult.status === 'error') {
            console.error(`  ${name}: ${healthResult.message}`);
          }
        });
      }
      return false;
    }

    if (health.status === 'warning') {
      console.warn('Health check warnings:', health.message);
      if (health.details) {
        Object.entries(health.details).forEach(([name, result]) => {
          const healthResult = result as HealthCheckResult;
          if (healthResult.status === 'warning') {
            console.warn(`  ${name}: ${healthResult.message}`);
          }
        });
      }
    }

    console.log('Health check passed:', health.message);
    this.isInitialized = true;
    return true;
  }
}

// Singleton instance
export const healthChecker = new HealthChecker();

// Auto-initialize in development mode
if (process.env.NODE_ENV === 'development') {
  healthChecker.initialize().catch(console.error);
}

// Export for manual health checks
export const runHealthCheck = () => healthChecker.getOverallHealth();
