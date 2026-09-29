const configuredApiUrl = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_API_URL;
const API_BASE_URL = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/+$/, '')}${/\/api$/i.test(configuredApiUrl) ? '' : '/api'}`
  : "https://agriot-backend.onrender.com/api";
const API_ORIGIN = new URL(API_BASE_URL, typeof window === 'undefined' ? 'https://agriot-backend.onrender.com' : window.location.origin).origin;

/**
 * Resolve Laravel storage URLs from API responses. Production data may contain
 * an APP_URL left as localhost; storage paths must still point to the API host.
 */
export const buildMediaUrl = (path, cacheBust) => {
  if (!path) return '';

  try {
    let url = new URL(path, API_ORIGIN);
    const isLocalHost = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(url.hostname);
    if (isLocalHost) {
      const apiUrl = new URL(API_BASE_URL, API_ORIGIN);
      url = new URL(`${url.pathname}${url.search}${url.hash}`, apiUrl.origin);
    }
    if (cacheBust) url.searchParams.set('v', String(cacheBust));
    return url.toString();
  } catch (_) {
    return path;
  }
};

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

  const token = localStorage.getItem("token");

  return fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  }).catch((error) => {
    console.error("[API] Fetch error:", error);
    throw error;
  });
};
