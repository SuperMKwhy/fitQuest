// Base URL for apps/server. On a simulator/web this can stay localhost, but
// on a physical device (Expo Go) it must be your machine's LAN IP — see
// README.md's "Running on a physical device" section.
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && authToken) headers.Authorization = `Bearer ${authToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Request to ${path} failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password, displayName) =>
    request('/auth/register', { method: 'POST', body: { email, password, displayName }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  getMe: () => request('/me'),
  updateMe: (fields) => request('/me', { method: 'PATCH', body: fields }),
  submitActivity: (activity) => request('/activities', { method: 'POST', body: activity }),
  getMyActivities: () => request('/activities/me'),
  getLeaderboard: () => request('/leaderboard'),
  getShopItems: () => request('/shop/items'),
  getFriends: () => request('/friends'),
  sendBuddyMessage: (message, history) =>
    request('/ai-buddy/chat', { method: 'POST', body: { message, history } }),
  scanFood: (imageBase64, mimeType) => request('/food-scan', { method: 'POST', body: { imageBase64, mimeType } }),
  // `date` must be the ISO instant of the caller's local midnight for that
  // day (see HealthLogScreen's `startOfDayISO`) — the server has no way to
  // know the caller's timezone, so it treats this literally as "today"
  // starts here, rather than re-deriving midnight itself.
  getFoodLog: (date) => request(`/food-log?date=${encodeURIComponent(date)}`),
  logFood: (entry) => request('/food-log', { method: 'POST', body: entry }),
};
