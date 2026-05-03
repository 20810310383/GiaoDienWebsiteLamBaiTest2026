import { apiFetchTongQuat } from "./apiTongQuat";

const ENDPOINT = "/api/lich-su-thi";

export async function getDanhSachLop(filter = {}, token) {
  return await apiFetchTongQuat(`${ENDPOINT}/filter/lop`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDanhSachBaiGiang(filter = {}, token) {
  return await apiFetchTongQuat(`${ENDPOINT}/filter/bai-giang`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getThongKe(token) {
  return await apiFetchTongQuat(`${ENDPOINT}/thong-ke`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getDanhSach(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`${ENDPOINT}/danh-sach?${queryString}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getChiTietBaiThi(id, token) {
  return await apiFetchTongQuat(`${ENDPOINT}/chi-tiet/${id}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
}
