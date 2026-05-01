// utils/auth.js
import instance from "./axios-customize";

const BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "") || "";
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";       // giữ cho tương thích cũ (không dùng)
const HAS_REFRESH_KEY = "has_refresh";     // cờ cho phép gọi /auth/refresh

let inMemoryAccessToken = null;
let refreshTimer = null;

/* ===== helpers ===== */
function getJwtExp(token, fallbackSec) {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return fallbackSec ? Math.floor(Date.now() / 1000) + fallbackSec : null;
  }
}
function scheduleRefresh(token) {
  const exp = getJwtExp(token);
  if (!exp) return;
  const msUntilRefresh = exp * 1000 - Date.now() - 30_000; // refresh sớm 30s
  if (refreshTimer) window.clearTimeout(refreshTimer);
  if (msUntilRefresh > 0) {
    refreshTimer = window.setTimeout(refreshAccessToken, msUntilRefresh);
  }
}

/* ===== public ===== */
export function getAccessToken() {
  return inMemoryAccessToken;
}

export function restoreSessionFromStorage() {
  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return false;
  inMemoryAccessToken = token;
  instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  scheduleRefresh(token);
  return true;
}

/**
 * Gọi sau khi login thành công.
 * - accessToken: bắt buộc
 * - hasRefreshCookie: true nếu server đã set cookie refresh (httpOnly)
 * - refreshToken: (tuỳ) nếu server trả trong body, không cần lưu localStorage
 */
export async function handleLoginSuccess({
  accessToken,
  hasRefreshCookie = false,
  refreshToken,          // optional, chỉ để xác định cờ
  expiresInSeconds,
  user
}) {
  inMemoryAccessToken = accessToken;

  // Lưu access token để sống qua F5
  localStorage.setItem(ACCESS_KEY, accessToken);

  // Bật/tắt cờ refresh dựa vào cookie hoặc body
  if (hasRefreshCookie || !!refreshToken) {
    localStorage.setItem(HAS_REFRESH_KEY, "1");
  } else {
    localStorage.removeItem(HAS_REFRESH_KEY);
  }

  // Header mặc định
  instance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  // Hẹn auto-refresh
  const exp = getJwtExp(accessToken, expiresInSeconds);
  if (exp) scheduleRefresh(accessToken);

  // Phát event + cố gắng lấy user
  try {
    const user = await instance.get("/auth/me").then(r => r.data);
    window.dispatchEvent(new CustomEvent("auth:login", { detail: { accessToken, user } }));
  } catch {
    window.dispatchEvent(new CustomEvent("auth:login", { detail: { accessToken } }));
  }
}

export function logout() {
  inMemoryAccessToken = null;
  if (refreshTimer) window.clearTimeout(refreshTimer);
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);      // không dùng nhưng xoá cho sạch
  localStorage.removeItem(HAS_REFRESH_KEY);
  delete instance.defaults.headers.common.Authorization;
  window.dispatchEvent(new Event("auth:logout"));
}

/* ===== refresh queue ===== */
let isRefreshing = false;
let refreshWaiters = [];
function notifyWaiters(ok) {
  refreshWaiters.forEach(resolve => resolve(ok));
  refreshWaiters = [];
}

export async function refreshAccessToken() {
  // Không có cờ => không gọi refresh (tránh lỗi khi chưa login)
  if (!localStorage.getItem(HAS_REFRESH_KEY)) return false;

  if (isRefreshing) return new Promise(resolve => refreshWaiters.push(resolve));
  isRefreshing = true;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // gửi cookie httpOnly
    });
    if (!res.ok) throw new Error("refresh failed");
    const data = await res.json();

    const accessToken = data?.data?.accessToken || data?.accessToken;
    const refreshToken = data?.refreshToken;
    if (!accessToken) throw new Error("no accessToken");

    // giữ cờ sau refresh OK
    localStorage.setItem(HAS_REFRESH_KEY, "1");
    await handleLoginSuccess({ accessToken, refreshToken, hasRefreshCookie: true });

    isRefreshing = false;
    notifyWaiters(true);
    return true;
  } catch {
    isRefreshing = false;
    notifyWaiters(false);
    localStorage.removeItem(HAS_REFRESH_KEY);
    delete instance.defaults.headers.common.Authorization;
    return false;
  }
}

export function isAuthenticated() {
  return !!localStorage.getItem(ACCESS_KEY);
}
