import axios from "axios"

// Put - send data in body
const savePost = async ({postId}) => {
    const token = localStorage.getItem('token');

    const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/post/${postId}/save`,
        {},  
        {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        }
    )

    return response.data;
}

export default savePost;