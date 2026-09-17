const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://agriot-backend.onrender.com/api";

export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const apiFetch = (path, options = {}) => {
  const url = buildApiUrl(path);
  console.log("[API] Requesting:", url);

  const isFormData = options?.body instanceof FormData;

  // Si es FormData, dejamos que el navegador gestione el Content-Type automáticamente
  const defaultHeaders = isFormData
    ? { Accept: "application/json" }
    : {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options?.headers,
    },
  }).catch((error) => {
    console.error("[API] Fetch error:", error);
    throw error;
  });
};