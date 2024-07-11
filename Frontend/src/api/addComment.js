import axios from "axios";

// Post - send data in body
const addComment = async ({postId, comment}) => {
    const token = localStorage.getItem('token');

    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/post/${postId}/comment`,
        {comment},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

export default addComment;