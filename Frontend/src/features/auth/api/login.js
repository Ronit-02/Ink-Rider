import api from "@/app/api";

// Post - send data in body
const loginUser = async (credentials) => {
    const response = await api.post(
        "/api/auth/login",
        credentials,
    )
    return response.data;
};

export {
    loginUser 
};