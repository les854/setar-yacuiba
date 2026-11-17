// src/api/apiClient.ts
import axios from 'axios';

// ⭐ URL del backend
const API_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ============================================
// INTERCEPTOR DE REQUEST: Agrega el token JWT
// ============================================
api.interceptors.request.use(
  (config) => {
    try {
      const usuarioStr = localStorage.getItem('usuario');
      if (usuarioStr) {
        const sesion = JSON.parse(usuarioStr);
        if (sesion.token) {
          config.headers.Authorization = `Bearer ${sesion.token}`;
          console.log('🔑 Token enviado en:', config.url);
        }
      }
    } catch (e) {
      console.error('❌ Error leyendo sesión:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================
// INTERCEPTOR DE RESPONSE
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log('✅ API:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.config?.url);
    console.log('   Status:', error.response?.status);
    console.log('   Data:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;