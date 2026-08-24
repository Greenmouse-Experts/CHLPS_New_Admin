export const FIFTY_MINUTES_MS = 50 * 60 * 1000;

export const isTokenExpired = (loginAt?: string | null): boolean => {
  if (!loginAt) return true;

  const loginTime = new Date(loginAt).getTime();
  const now = Date.now();

  return now > loginTime + FIFTY_MINUTES_MS;
};

/**
 * Decodes a JWT token's payload without verifying the signature.
 * Used client-side to read claims (e.g. permissions) embedded by the server.
 */
export function decodeJwtPayload<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}
