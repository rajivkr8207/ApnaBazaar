// ─── App Config ───────────────────────────────────────────────────────────────

const Backend_Api_Url = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';
const APP_MODE       = import.meta.env.VITE_APP_MODE || 'development';
const APP_NAME       = import.meta.env.VITE_APP_NAME || 'ApnaBazaar';

export {
  Backend_Api_Url,
  APP_MODE,
  APP_NAME,
}
