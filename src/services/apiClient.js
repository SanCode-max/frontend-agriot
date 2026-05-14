// En Vercel, asegúrate de configurar la variable REACT_APP_API_BASE_URL
// En desarrollo, React proxy usa http://localhost:3000 (ver setupProxy.js)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://backend-agriot.onrender.com";

export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const apiFetch = (path, options) => {
  const url = buildApiUrl(path);
  console.log("[API] Requesting:", url); // Debug: ver qué URL se usa
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
