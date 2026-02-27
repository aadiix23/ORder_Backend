import axios from 'axios';

const API_URL = 'http://localhost:6001'; // Backend running on 6001

const api = axios.create({
    baseURL: API_URL,
});

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const menuApi = {
    getAll: (restaurantId) => api.get(`/menu${restaurantId ? `?restaurantId=${restaurantId}` : ''}`),
    getById: (id) => api.get(`/menu/${id}`),
    search: (keyword, restaurantId) => api.get(`/menu/search?keyword=${keyword}${restaurantId ? `&restaurantId=${restaurantId}` : ''}`),
    getByCategory: (category, restaurantId) => api.get(`/menu/category/${category}${restaurantId ? `?restaurantId=${restaurantId}` : ''}`),
    create: (data) => api.post('/menu', data, { headers: getAuthHeader() }),
    update: (id, data) => api.put(`/menu/${id}`, data, { headers: getAuthHeader() }),
    delete: (id, restaurantId) => api.delete(`/menu/${id}${restaurantId ? `?restaurantId=${restaurantId}` : ''}`, { headers: getAuthHeader() }),
};

export const restaurantApi = {
    getById: (id) => api.get(`/restaurant/${id}`),
    getBySlug: (slug) => api.get(`/restaurant/slug/${slug}`),
};

export const cartApi = {
    get: (tableNumber, restaurantId) => api.get(`/cart/${tableNumber}?restaurantId=${restaurantId}`),
    add: (data) => api.post('/cart/add', data),
    update: (data) => api.put('/cart/update', data),
    remove: (data) => api.delete('/cart/remove', { data }),
    clear: (tableNumber, restaurantId) => api.delete(`/cart/clear/${tableNumber}?restaurantId=${restaurantId}`),
};

export const orderApi = {
    getAll: () => api.get('/order', { headers: getAuthHeader() }),
    place: (data) => api.post('/order/place', data),
    getByTable: (tableNumber, restaurantId) => api.get(`/order/table/${tableNumber}?restaurantId=${restaurantId}`),
    updateStatus: (id, status) => api.put(`/order/${id}/status`, { status }, { headers: getAuthHeader() }),
};

export const uploadApi = {
    image: (file, onProgress) => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/upload', formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            },
        });
    },
};

export default api;
