import type { AxiosInstance } from 'axios'
import axios from 'axios'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACK_END_API_BASE_URL,
  headers: {
    'Content-type': 'application/json'
  }
})

export default axiosInstance
