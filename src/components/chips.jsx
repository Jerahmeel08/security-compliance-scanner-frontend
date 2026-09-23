const SEV_KEYS = { Critical: 'crit', High: 'high', Medium: 'med', Low: 'low' };

export const sevKey = s => SEV_KEYS[s];

export const chip = (text, tone) => (
  <span className={`chip chip--${tone}`}>{text}</span>
);

export const statusChip = status => chip(
  status,
  status === 'Authorized' || status === 'Resolved' ? 'ok' : status === 'Pending' || status === 'Open' ? 'warn' : 'info'
);
