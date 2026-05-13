import api from '../api.js';

// Post - send data in body
const signupUser = async (credentials) => {
    const response = await api.post(
        "/api/auth/signup",
        credentials,
    )
    return response.data;
}

export { signupUser };