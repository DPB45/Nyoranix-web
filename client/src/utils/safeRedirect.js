// The login/register pages accept ?redirect=/some/path. Only allow in-app paths,
// otherwise ?redirect=https://evil.example (or //evil.example) becomes an open redirect.
export const safeRedirect = (value, fallback = '/') => {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback;
  }
  return value;
};
