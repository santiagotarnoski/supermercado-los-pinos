import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Ruta base
});

export const loginUser = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error al iniciar sesión' };
  }
};
