import axios from "axios"

// Post - send data in body
const resetPassword = async (credentials) => {

    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        credentials,
    );
    return response.data;
}

export default resetPassword;