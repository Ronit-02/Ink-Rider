import api from "@/app/api";

// Post - send data in body
const signupUser = async (credentials) => {
    const response = await api.post(
        "/api/auth/signup",
        credentials,
    )
    return response.data;
}

export { signupUser };