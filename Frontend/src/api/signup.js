import axios from "axios"

const signup = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        credentials
    )
    return response.data;
}

export default signup;