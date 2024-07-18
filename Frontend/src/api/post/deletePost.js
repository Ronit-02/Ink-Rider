import axios from "axios"

const deletePost = async ({id}) => {

    const token = localStorage.getItem('token');

    const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/post/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

export default deletePost;