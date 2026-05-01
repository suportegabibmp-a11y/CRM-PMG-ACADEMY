import React, { useEffect } from 'react';
import { generateCSPHeader, SECURITY_CONFIG } from '../../security/securityConfig';

interface SecurityHeadersProps {
  children: React.ReactNode;
}

export const SecurityHeaders: React.FC<SecurityHeadersProps> = ({ children }) => {
  useEffect(() => {
    // Set security headers for client-side routing
    const setSecurityHeaders = () => {
      // Content Security Policy
      const cspHeader = generateCSPHeader();
      const metaCSP = document.createElement('meta');
      metaCSP.httpEquiv = 'Content-Security-Policy';
      metaCSP.content = cspHeader;
      document.head.appendChild(metaCSP);

      // X-Frame-Options
      const metaFrameOptions = document.createElement('meta');
      metaFrameOptions.httpEquiv = 'X-Frame-Options';
      metaFrameOptions.content = 'DENY';
      document.head.appendChild(metaFrameOptions);

      // X-Content-Type-Options
      const metaContentType = document.createElement('meta');
      metaContentType.httpEquiv = 'X-Content-Type-Options';
      metaContentType.content = 'nosniff';
      document.head.appendChild(metaContentType);

      // Referrer Policy
      const metaReferrer = document.createElement('meta');
      metaReferrer.httpEquiv = 'Referrer-Policy';
      metaReferrer.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(metaReferrer);

      // Permissions Policy
      const metaPermissions = document.createElement('meta');
      metaPermissions.httpEquiv = 'Permissions-Policy';
      metaPermissions.content = 'camera=(), microphone=(), geolocation=()';
      document.head.appendChild(metaPermissions);
    };

    setSecurityHeaders();

    // Cleanup function to remove added meta tags
    return () => {
      const metaTags = document.head.querySelectorAll('meta[http-equiv]');
      metaTags.forEach(tag => tag.remove());
    };
  }, []);

  return <>{children}</>;
};

// Hook for security monitoring
export const useSecurityMonitoring = () => {
  useEffect(() => {
    // Monitor for XSS attempts
    const handleXSSAttempt = (event: MessageEvent) => {
      // Check for suspicious messages
      if (event.origin !== window.location.origin) {
        console.warn('Potential XSS attempt detected:', event.origin);
        // Block suspicious cross-origin messages
        event.stopImmediatePropagation();
      }
    };

    // Monitor for console access (potential debugging attempts)
    const originalConsole = { ...console };
    let consoleAccessCount = 0;
    const MAX_CONSOLE_ACCESS = 10;

    const monitorConsoleAccess = () => {
      consoleAccessCount++;
      if (consoleAccessCount > MAX_CONSOLE_ACCESS) {
        console.warn('Excessive console access detected - potential security risk');
        // Could implement additional security measures here
      }
    };

    // Override console methods to monitor access
    Object.keys(console).forEach(method => {
      if (typeof console[method] === 'function') {
        console[method] = (...args: any[]) => {
          monitorConsoleAccess();
          return originalConsole[method](...args);
        };
      }
    });

    window.addEventListener('message', handleXSSAttempt);

    return () => {
      window.removeEventListener('message', handleXSSAttempt);
      // Restore original console
      Object.assign(console, originalConsole);
    };
  }, []);
};

// Component for security monitoring
export const SecurityMonitor: React.FC = () => {
  useSecurityMonitoring();
  return null;
};

// Hook for detecting suspicious activity
export const useSuspiciousActivityDetection = () => {
  useEffect(() => {
    let failedAttempts = 0;
    const MAX_FAILED_ATTEMPTS = 5;

    const detectSuspiciousActivity = () => {
      failedAttempts++;
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        console.warn('Suspicious activity detected - multiple failed attempts');
        // Could trigger additional security measures
        // For example: lock account, notify admin, etc.
      }
    };

    // Monitor for rapid form submissions
    let submissionCount = 0;
    let lastSubmissionTime = 0;
    const RAPID_SUBMISSION_THRESHOLD = 3; // submissions
    const RAPID_SUBMISSION_TIME_WINDOW = 5000; // 5 seconds

    const monitorFormSubmissions = () => {
      const now = Date.now();
      if (lastSubmissionTime > 0 && now - lastSubmissionTime < RAPID_SUBMISSION_TIME_WINDOW) {
        submissionCount++;
        if (submissionCount >= RAPID_SUBMISSION_THRESHOLD) {
          console.warn('Rapid form submissions detected - potential bot activity');
          detectSuspiciousActivity();
        }
      } else {
        submissionCount = 1;
      }
      lastSubmissionTime = now;
    };

    // Monitor all form submissions
    document.addEventListener('submit', monitorFormSubmissions);

    return () => {
      document.removeEventListener('submit', monitorFormSubmissions);
    };
  }, []);
};
