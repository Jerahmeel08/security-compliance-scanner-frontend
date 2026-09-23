export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function focusFirstInvalid() {
  document.querySelector('[aria-invalid="true"]')?.focus();
}

export function nameFromEmail(email) {
  return email
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
