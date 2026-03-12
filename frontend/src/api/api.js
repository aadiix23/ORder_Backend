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
    getTableStatuses: (restaurantId) => api.get(`/restaurant/${restaurantId}/table-status`, { headers: getAuthHeader() }),
    updateTableStatus: (restaurantId, data) => api.put(`/restaurant/${restaurantId}/table-status`, data, { headers: getAuthHeader() }),
    updateDetails: (restaurantId, data) => api.put(`/restaurant/${restaurantId}`, data, { headers: getAuthHeader() }),
    updateMenuUi: (restaurantId, data) => api.put(`/restaurant/${restaurantId}/menu-ui`, data, { headers: getAuthHeader() }),
};

export const authApi = {
    login: (data) => api.post('/user/login', data),
    register: (data) => api.post('/user/register', data),
};

const getSuperAdminHeader = () => {
    const token = localStorage.getItem('sa_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const superadminApi = {
    login: (data) => api.post('/user/login', data),
    getStats: () => api.get('/superadmin/stats', { headers: getSuperAdminHeader() }),
    getRestaurants: () => api.get('/superadmin/restaurants', { headers: getSuperAdminHeader() }),
    getRestaurantDetail: (id) => api.get(`/superadmin/restaurant/${id}/detail`, { headers: getSuperAdminHeader() }),
    getUsers: () => api.get('/superadmin/users', { headers: getSuperAdminHeader() }),
    getOrders: (params = {}) => {
        const qs = new URLSearchParams(params).toString();
        return api.get(`/superadmin/orders${qs ? `?${qs}` : ''}`, { headers: getSuperAdminHeader() });
    },
    deleteRestaurant: (id) => api.delete(`/superadmin/restaurant/${id}`, { headers: getSuperAdminHeader() }),
    toggleUser: (id, disabled) => api.patch(`/superadmin/user/${id}/toggle`, { disabled }, { headers: getSuperAdminHeader() }),
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
    getHistory: (phone, restaurantId) => api.get(`/order/history/${phone}?restaurantId=${restaurantId}`),
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
