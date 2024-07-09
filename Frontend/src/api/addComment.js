import axios from "axios";

const addComment = async ({id, comment}) => {
    const token = localStorage.getItem('token');

    const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/post/${id}/comment`,
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