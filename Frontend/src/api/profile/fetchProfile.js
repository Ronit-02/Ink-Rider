import axios from "axios";

const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

export default fetchProfile;