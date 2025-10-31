// /fronted/src/api/axios.js

import axios from 'axios';

// 1. Cria uma instância do Axios
const apiClient = axios.create({
  // A baseURL '/api' fará com que o proxy do Vite (que configuramos)
  // redirecione todas as chamadas para http://localhost:3000/api
  baseURL: '/api' 
});

// 2. Interceptor (MUITO IMPORTANTE)
// Isso vai anexar o token JWT a CADA requisição que fizermos
// para o backend, automaticamente.
apiClient.interceptors.request.use(config => {
  // Pega o token do localStorage (que a Pinia vai salvar lá)
  const token = localStorage.getItem('token');
  
  if (token) {
    // Anexa o token no header, como o middleware 'autenticarAdmin' espera
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

export default apiClient;