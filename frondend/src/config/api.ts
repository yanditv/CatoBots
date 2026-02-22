// API usa rutas relativas - el proxy de Vite maneja la redirección
const API_URL = ''

export const api = {
  get: (path: string, options?: RequestInit) => 
    fetch(`${API_URL}${path}`, options),
  
  post: (path: string, body?: any, options?: RequestInit) => {
    const fetchOptions: RequestInit = {
      method: 'POST',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    }
    if (body && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body)
    }
    return fetch(`${API_URL}${path}`, fetchOptions)
  },
  
  put: (path: string, body?: any, options?: RequestInit) => {
    const fetchOptions: RequestInit = {
      method: 'PUT',
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    }
    if (body && Object.keys(body).length > 0) {
      fetchOptions.body = JSON.stringify(body)
    }
    return fetch(`${API_URL}${path}`, fetchOptions)
  },
  
  del: (path: string, options?: RequestInit) =>
    fetch(`${API_URL}${path}`, { ...options, method: 'DELETE' }),
  
  upload: (path: string, formData: FormData, options?: RequestInit) =>
    fetch(`${API_URL}${path}`, {
      ...options,
      method: 'POST',
      body: formData,
    }),
}

// Socket.io también usa rutas relativas
export const SOCKET_URL = ''
export const UPLOADS_URL = '/uploads'
