export const ICONS = {
  overview: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  apps: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><path d="M17.5 14v7M14 17.5h7"/>',
  assess: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4h6v3H9zM9 14l2 2 4-4"/>',
  findings: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.01"/>',
  remediation: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  members: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6"/><circle cx="17.5" cy="9" r="2.5"/><path d="M17 14c2.6 0 4.5 1.8 4.5 4.5"/>',
  account: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  right: '<path d="M9 5l7 7-7 7"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 6.6C3.7 8.4 2 12 2 12s3.6 7 10 7c1.7 0 3.2-.4 4.5-1M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  building: '<rect x="4" y="3" width="10" height="18" rx="1.5"/><path d="M14 9h4a2 2 0 0 1 2 2v10h-6M8 7h2M8 11h2M8 15h2"/>',
  userplus: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6M19 8v6M16 11h6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
  activity: '<path d="M3 12h4l3 9 4-18 3 9h4"/>',
  health: '<path d="M12 21s-7.5-4.6-10-9.3C.4 8.2 2 4.5 5.8 4c2-.3 3.8.6 4.9 2.1C11.8 4.6 13.6 3.7 15.6 4c3.8.5 5.4 4.2 3.8 7.7C16.9 16.4 12 21 12 21z"/><path d="M6 12h3l1.5 3 2-6 1.5 3H18"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>'
};

export const PAGES = {
  overview: ['Security Overview', 'overview'],
  applications: ['Applications', 'apps'],
  assessment: ['Assessment Overview', 'assess'],
  findings: ['Findings', 'findings'],
  remediation: ['Remediation', 'remediation'],
  members: ['Members', 'members'],
  account: ['Account', 'account']
};

export const SIDE = ['overview', 'applications', 'assessment', 'findings', 'remediation', 'members'];
export const SIDE_DEVELOPER = SIDE.filter(p => p !== 'members');
export const TAB = [
  ['overview', 'Overview'],
  ['applications', 'Apps'],
  ['assessment', 'Assess'],
  ['findings', 'Findings']
];
export const MORE = ['remediation', 'members', 'account'];
export const MORE_DEVELOPER = MORE.filter(p => p !== 'members');

export const ADMIN_PAGES = {
  overview: ['System Overview', 'overview'],
  users: ['User Management', 'members'],
  organizations: ['Organization Management', 'building'],
  applications: ['Application Management', 'apps'],
  assessments: ['Assessment Monitoring', 'assess'],
  activity: ['System Activity', 'activity'],
  health: ['System Health', 'health']
};

export const ADMIN_SIDE = ['overview', 'users', 'organizations', 'applications', 'assessments', 'activity', 'health'];
