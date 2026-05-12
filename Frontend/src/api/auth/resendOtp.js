import axios from "axios";

// Post - send data in body
const resendOtp = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/resend-otp`,
        credentials,
    )
    return response.data;
};

export { 
    resendOtp 
};