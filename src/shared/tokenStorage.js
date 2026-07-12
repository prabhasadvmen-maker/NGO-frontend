export const TOKEN_KEYS = {
  SUPERADMIN: 'advmen_superadmin_token',
  ADMIN: 'advmen_admin_token',
  MEMBER: 'advmen_member_token',
};

export function getRoleFromPath(pathname) {
  if (pathname.startsWith('/member')) return 'MEMBER';
  if (pathname.startsWith('/admin')) return 'ADMIN';
  if (pathname === '/superadmin/login' || pathname === '/login' || pathname === '/') return null;
  return 'SUPERADMIN';
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
