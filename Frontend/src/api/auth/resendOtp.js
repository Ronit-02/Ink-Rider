import api from "../api.js";

// Post - send data in body
const resendOtp = async (credentials) => {
    const response = await api.post(
        "/api/auth/resend-otp",
        credentials,
    )
    return response.data;
};

export { 
    resendOtp 
};