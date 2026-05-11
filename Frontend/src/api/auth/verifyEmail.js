import axios from 'axios'

// Post - send data in body
const verifyEmail = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-email`,
        credentials,
    )
    return response.data;
}

export { verifyEmail };