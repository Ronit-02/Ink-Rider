import axios from "axios"

// Put - send data in body
const followUser = async ({userId}) => {
    const token = localStorage.getItem('token');

    const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/user/${userId}/follow`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    );

    return response.data;
}

export default followUser;