// Static reference data for the scan-configuration UI, kept in sync with the
// real backend's check registry (src/modules/scans/checks/registry.js) —
// ids, categories and profile tiers (QUICK ⊂ STANDARD ⊂ FULL) are verified
// against the live backend, not guessed.
export const QUICK_CHECKS = [
  { id: 'SC-01', label: 'HTTPS Enforcement', category: 'Security Configuration' },
  { id: 'SC-02', label: 'HSTS Detection', category: 'Security Configuration' },
  { id: 'SC-03', label: 'Content Security Policy', category: 'Security Configuration' },
  { id: 'SC-04', label: 'X-Content-Type-Options', category: 'Security Configuration' },
  { id: 'SC-05', label: 'Security Headers Baseline', category: 'Security Configuration' },
  { id: 'SE-01', label: 'Secure Cookie Flag', category: 'Session Security' },
  { id: 'SE-02', label: 'HttpOnly Flag', category: 'Session Security' },
  { id: 'SE-03', label: 'SameSite Attribute', category: 'Session Security' },
  { id: 'DE-03', label: 'Technical Disclosure', category: 'Data Exposure' },
  { id: 'TS-02', label: 'TLS Configuration', category: 'Transport Security' },
  { id: 'TS-03', label: 'Certificate Validation', category: 'Transport Security' },
  { id: 'TS-04', label: 'Insecure HTTP Behavior', category: 'Transport Security' }
];

export const STANDARD_ONLY_CHECKS = [
  { id: 'AC-01', label: 'Authentication-Required Resources', category: 'Access Control' },
  { id: 'API-03', label: 'Endpoint Exposure', category: 'API Security' },
  { id: 'DE-01', label: 'Sensitive Information Disclosure', category: 'Data Exposure' },
  { id: 'DE-02', label: 'Verbose Error Messages', category: 'Data Exposure' }
];

export const FULL_ONLY_CHECKS = [
  { id: 'AU-03', label: 'Rate Limiting', category: 'Authentication Security' },
  { id: 'AC-02', label: 'Unauthorized Resource Access', category: 'Access Control' },
  { id: 'IN-01', label: 'Reflected XSS', category: 'Injection' },
  { id: 'IN-02', label: 'Error-Based SQL Injection', category: 'Injection' }
];

export const STANDARD_CHECKS = [...QUICK_CHECKS, ...STANDARD_ONLY_CHECKS];
export const FULL_CHECKS = [...STANDARD_CHECKS, ...FULL_ONLY_CHECKS];
export const ALL_CHECKS = FULL_CHECKS;

export const SCAN_PROFILES = [
  { id: 'quick', name: 'Quick Scan', purpose: 'Fast, low-impact assessment containing primarily passive checks.', checks: QUICK_CHECKS },
  { id: 'standard', name: 'Standard Scan', purpose: 'Everything in Quick Scan, plus access-control and data-exposure checks.', checks: STANDARD_CHECKS },
  { id: 'full', name: 'Full Assessment', purpose: 'Everything in Standard Scan, plus active authentication and injection testing.', checks: FULL_CHECKS },
  { id: 'custom', name: 'Custom Scan', purpose: 'Manually select the individual checks to execute.', checks: [] }
];
