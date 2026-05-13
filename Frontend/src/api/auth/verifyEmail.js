import api from "../api.js";

// Post - send data in body
const verifyEmail = async (credentials) => {
    const response = await api.post(
        "/api/auth/verify-email",
        credentials,
    )
    return response.data;
}

export { verifyEmail };