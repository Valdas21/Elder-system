export const getAccessToken = () => localStorage.getItem("accessToken") || "";
export const setAccessToken = (t: string) => localStorage.setItem("accessToken", t);

export const getRefreshToken = () => localStorage.getItem("refreshToken") || "";
export const setRefreshToken = (t: string) => localStorage.setItem("refreshToken", t);

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};