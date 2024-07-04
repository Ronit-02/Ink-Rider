import axios from "axios"

const resetPassword = async ({password, token}) => {

    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/reset-password`,
        {password, token}
    );
    return response.data;
}

export default resetPassword;