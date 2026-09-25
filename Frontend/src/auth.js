/**
 * Token and authentication utility functions.
 */

/**
 * Validates whether the token is a non-empty, well-formatted, non-expired JWT.
 * @param {string|null|undefined} token
 * @returns {boolean}
 */
export function isTokenValid(token) {
  if (!token || typeof token !== "string") return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return false;

  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && typeof payload.exp === "number") {
      if (payload.exp * 1000 <= Date.now()) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks authentication status and removes stale or expired tokens.
 * @returns {boolean}
 */
export function isAuthenticated() {
  const token = localStorage.getItem("token");
  const valid = isTokenValid(token);
  if (!valid && token) {
    localStorage.removeItem("token");
  }
  return valid;
}
