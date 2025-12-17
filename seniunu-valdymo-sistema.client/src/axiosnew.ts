import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from "./Tokens";


console.log("VITE_API_URL =", import.meta.env.VITE_API_URL);
    console.log("VITE_API_URL runtime =", import.meta.env.VITE_API_URL);
    
const axiosnew = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: false,
});

// Add access token to every request
axiosnew.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

function addToQueue(cb: (token: string) => void) {
  queue.push(cb);
}
function runQueue(newToken: string) {
  queue.forEach(cb => cb(newToken));
  queue = [];
}

// Refresh on 401 and retry once
axiosnew.interceptors.response.use(
  res => res,
  async (error: AxiosError) => {
    const original: any = error.config;
    
    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addToQueue((newAccess) => {
          original.headers.Authorization = `Bearer ${newAccess}`;
          resolve(axiosnew(original));
        });
      });
    }

    isRefreshing = true;
    try {
      // IMPORTANT: this endpoint must exist in backend
      const refreshRes = await axiosnew.post("/api/Users/refresh",
        { refreshToken }
      );

      const newAccess = (refreshRes.data as any).accessToken;
      const newRefresh = (refreshRes.data as any).refreshToken;

      if (!newAccess || !newRefresh) throw new Error("Invalid refresh response");

      setAccessToken(newAccess);
      setRefreshToken(newRefresh);

      runQueue(newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return axiosnew(original);
    } catch (e) {
      clearTokens();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosnew;
