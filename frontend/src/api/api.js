import axios from 'axios';

const API_URL = 'http://localhost:6001'; // Backend running on 6001

const api = axios.create({
    baseURL: API_URL,
});

export const menuApi = {
    getAll: () => api.get('/menu'),
    getById: (id) => api.get(`/menu/${id}`),
    search: (keyword) => api.get(`/menu/search?keyword=${keyword}`),
    getByCategory: (category) => api.get(`/menu/category/${category}`),
};

export const cartApi = {
    get: (tableNumber) => api.get(`/cart/${tableNumber}`),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (data) => api.delete('/cart/remove', { data }),
    clear: (tableNumber) => api.delete(`/cart/clear/${tableNumber}`),
};

export default api;
