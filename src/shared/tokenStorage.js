export const TOKEN_KEYS = {
  SUPERADMIN: 'savitram_superadmin_token',
  ADMIN: 'savitram_admin_token',
  MEMBER: 'savitram_member_token',
};

export function getRoleFromPath(pathname) {
  if (pathname.startsWith('/member')) return 'MEMBER';
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (
    pathname.startsWith('/superadmin') ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/org') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/donations') ||
    pathname.startsWith('/certificates') ||
    pathname.startsWith('/id-cards') ||
    pathname.startsWith('/finance') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/website-cms') ||
    pathname.startsWith('/communication') ||
    pathname.startsWith('/media-library') ||
    pathname.startsWith('/forms') ||
    pathname.startsWith('/audit-logs') ||
    pathname.startsWith('/backup') ||
    pathname.startsWith('/api-integrations') ||
    pathname.startsWith('/ai-center') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/help')
  ) return 'SUPERADMIN';
  return null;
}

export function getTokenKeyForRole(role) {
  if (role === 'SUPERADMIN') return TOKEN_KEYS.SUPERADMIN;
  if (role === 'ADMIN') return TOKEN_KEYS.ADMIN;
  if (role === 'MEMBER') return TOKEN_KEYS.MEMBER;
  return null;
}

export function saveToken(role, token) {
  const key = getTokenKeyForRole(role);
  if (key && token) localStorage.setItem(key, token);
}

export function getToken(role) {
  const key = getTokenKeyForRole(role);
  return key ? localStorage.getItem(key) : null;
}

export function clearToken(role) {
  const key = getTokenKeyForRole(role);
  if (key) localStorage.removeItem(key);
}

export function clearAllTokens() {
  Object.values(TOKEN_KEYS).forEach((k) => localStorage.removeItem(k));
}
