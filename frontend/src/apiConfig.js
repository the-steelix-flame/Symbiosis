// Symbiosis/frontend/src/apiConfig.js

const getApiBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // This is for Vercel deployment
    return '/api';
  } else {
    // This is for local development
    return 'http://localhost:8000/api';
  }
};

export const API_BASE_URL = getApiBaseUrl();