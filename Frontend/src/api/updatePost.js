import axios from "axios";

// Put - send data in body
const updatePost = async ({id, formData}) => {
    const token = localStorage.getItem('token');
    
    const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/post/${id}`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            }
        }
    );

    return response.data;
}

export default updatePost;