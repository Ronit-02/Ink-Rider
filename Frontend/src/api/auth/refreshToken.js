import axios from 'axios';

const refreshToken = async () => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/refresh-token`,
        {}, 
        { withCredentials: true }  // include cookies for refresh token
    );
    return response.data;
}

export default refreshToken;