import axios from "axios"

const forgotPassword = async (email) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/forgot-password`,
        email
    )

    return response.data;
}

export default forgotPassword;