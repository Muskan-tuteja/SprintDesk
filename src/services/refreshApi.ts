import axios from "axios";

const refreshApi = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

export const refreshAccessToken = async (
  refreshToken: string
): Promise<{
  accessToken: string;
  refreshToken: string;
}> => {
  const response = await refreshApi.post("/auth/refresh", {
    refreshToken,
    expiresInMins: 30,
  });

  return response.data;
};