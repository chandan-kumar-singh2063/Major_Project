import api from './config';

export const ordersAPI = {
  getOrders: () => api.get('/orders/'),
  getOrderDetail: (id) => api.get(`/orders/${id}/`),
  createOrder: (orderData) => api.post('/orders/', orderData),
  getMyOrders: () => api.get('/orders/my/'),
};
