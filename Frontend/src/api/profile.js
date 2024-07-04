import axios from "axios";

const token = localStorage.getItem('token');

const fetchUser = async () => {
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    return response.data;
}

export default fetchUser;