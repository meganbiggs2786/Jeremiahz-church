import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://tuath-coir-api.YOUR-ACCOUNT.workers.dev'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getProducts = async (category?: string) => {
  const response = await api.get('/api/products', {
    params: { category },
  })
  return response.data
}

export const getProduct = async (id: string | number) => {
  const response = await api.get(`/api/products/${id}`)
  return response.data
}

export const getCategories = async () => {
  const response = await api.get('/api/categories')
  return response.data
}

export const createInitiation = async (data: any) => {
  const response = await api.post('/api/initiation', data)
  return response.data
}

export const createOrder = async (data: any) => {
  const response = await api.post('/api/orders', data)
  return response.data
}

export const createPaymentIntent = async (data: { order_number: string, amount: string }) => {
  const response = await api.post('/api/payment/create-intent', data)
  return response.data
}
