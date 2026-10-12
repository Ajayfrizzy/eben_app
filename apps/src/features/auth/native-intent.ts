// Reject malformed/oversized external URLs before Expo Router's legacy decoder runs.
// This mitigates native entry points; it does not remove the dependency advisory.
export function sanitizeNativeIntent(path: string) {
  if (path.length > 8192) return "/auth-callback?error=invalid_link";
  try {
    decodeURIComponent(path);
  } catch {
    return "/auth-callback?error=invalid_link";
  }
  return path;
}
