import { apiFetchTongQuat } from "./apiTongQuat";


export async function nopBaiThi(data, token) {
  return await apiFetchTongQuat("/api/lichsuthi/nop-bai", {
    method: "POST",
    body: data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function getMyHistory(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/lichsuthi/my-history?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}


export async function getHistoryDetail(id, token) {
  return await apiFetchTongQuat(`/api/lichsuthi/detail/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getStudentHistory(params = {}, token) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/lichsuthi/student-history?${queryString}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}