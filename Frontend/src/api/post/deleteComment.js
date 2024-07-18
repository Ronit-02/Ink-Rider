import axios from "axios"

// Delete - send data in data
const deleteComment = async ({postId, commentId}) => {
    const token = localStorage.getItem('token');

    const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/post/${postId}/delete-comment`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {commentId},
        }
    );

    return response.data;
}

export default deleteComment;