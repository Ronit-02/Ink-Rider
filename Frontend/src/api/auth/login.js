import axios from "axios";

// Post - send data in body
const loginUser = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        credentials,
    )
    return response.data;
};

export { 
    loginUser 
};