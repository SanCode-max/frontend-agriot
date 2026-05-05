const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://backend-agriot.onrender.com";

export const buildApiUrl = (path) => {
  if (!path.startsWith("/")) {
    return `${API_BASE_URL}/${path}`;
  }
  return `${API_BASE_URL}${path}`;
};

export const apiFetch = (path, options) => fetch(buildApiUrl(path), options);
