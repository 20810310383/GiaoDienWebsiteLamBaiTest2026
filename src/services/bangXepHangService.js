import { apiFetchTongQuat } from "./apiTongQuat";


export async function getGlobalLeaderboard(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  return await apiFetchTongQuat(`/api/bangxephang/global?${queryString}`, {
    method: "GET",
  });
}


export async function getMyGlobalRank(token) {
  return await apiFetchTongQuat(`/api/bangxephang/my-rank`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}