import axios from 'axios';

let refreshPromise = null

const refreshToken = () => {
    if (!refreshPromise) {
        refreshPromise = axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
            {},
            { withCredentials: true }, // include cookies for refresh token
        )
            .then(response => response.data)
            .finally(() => {
                refreshPromise = null
            })
    }

    return refreshPromise
}

export default refreshToken;
