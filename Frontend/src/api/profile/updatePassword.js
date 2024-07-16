import axios from "axios";

// Put - send data in body
const updatePassword = async (formData) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/profile/update-password`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}   

export default updatePassword;