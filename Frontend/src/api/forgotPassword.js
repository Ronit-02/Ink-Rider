import axios from "axios"

// Post - send data in body
const forgotPassword = async (email) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        email
    )

    return response.data;
}

export default forgotPassword;