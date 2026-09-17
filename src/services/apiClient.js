
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://agriot-backend.onrender.com";

export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const apiFetch = (path, options) => {
  const url = buildApiUrl(path);
  console.log("[API] Requesting:", url); 
  return fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      "Content-Type": "application/json",
    },
  }).catch((error) => {
    console.error("[API] Fetch error:", error);
    throw error;
  });
};
