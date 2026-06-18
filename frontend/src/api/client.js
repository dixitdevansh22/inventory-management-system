import axios from 'axios'

// Backend ka URL environment variable se aayega
// Vite mein env variables VITE_ prefix ke saath honi chahiye
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api
