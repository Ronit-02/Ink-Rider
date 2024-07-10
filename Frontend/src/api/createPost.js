import axios from "axios"

const token = localStorage.getItem('token');

// Post - send data in body
const createPost = async (credentials) => {
    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/post/`,
        credentials,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
    )

    return response.data;
}

export default createPost;