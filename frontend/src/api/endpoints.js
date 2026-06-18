import api from './client'

// ---------- Products ----------
export const getProducts = () => api.get('/products/')
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (data) => api.post('/products/', data)
export const updateProduct = (id, data) => api.put(`/products/${id}`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// ---------- Customers ----------
export const getCustomers = () => api.get('/customers/')
export const createCustomer = (data) => api.post('/customers/', data)

// ---------- Orders ----------
export const getOrders = () => api.get('/orders/')
export const createOrder = (data) => api.post('/orders/', data)
