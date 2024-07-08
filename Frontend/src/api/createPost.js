import axios from "axios"

const token = localStorage.getItem('token');

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