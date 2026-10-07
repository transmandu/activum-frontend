import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
    timeout: 120000,
});

// Interceptor de solicitud - añade el token si existe
api.interceptors.request.use(
    config => {
        // Solo mostramos el payload si realmente existe (POST, PUT, etc.) y estamos en desarrollo
        if (config.data && import.meta.env.DEV) {
            console.log(`[axios] Payload enviado a ${config.url}:`, JSON.stringify(config.data, null, 2));
        }

        const token = localStorage.getItem('token');
        if (token) {
            const tokenLimpio = token.trim();
            config.headers.Authorization = `Bearer ${tokenLimpio}`;
            // ...
            // Solo mostramos en consola en modo desarrollo (opcional)
            if (import.meta.env.DEV) {
                console.log('Token enviado:', tokenLimpio.substring(0, 20) + '...');
            }
        }
        // NO mostramos warning si no hay token, para mantener la consola limpia
        return config;
    },
    error => {
        console.error('Error en interceptor de solicitud:', error);
        return Promise.reject(error);
    }
);

// Interceptor de respuesta - maneja errores comunes
api.interceptors.response.use(
    response => {
        // Solo mostramos en desarrollo
        if (import.meta.env.DEV) {
            console.log(`Respuesta ${response.status} de ${response.config.url}`);
        }
        return response;
    },
    error => {
        if (error.code === 'ECONNABORTED' || error.message === 'Network Error') {
            console.error('🌐 Error de red o timeout:', error);
        } else if (error.response) {
            console.error(`Error ${error.response.status} en ${error.config.url}`);
            if (error.response.status === 401) {
                console.error('Token inválido o expirado. Redirigiendo a login...');
                // Limpiar sesión y redirigir
                localStorage.removeItem('token');
                localStorage.removeItem('transmandu_sesion');
                window.location.href = '/';
            }
        } else {
            console.error('❌ Error desconocido:', error);
        }
        return Promise.reject(error);
    }
);

export default api;