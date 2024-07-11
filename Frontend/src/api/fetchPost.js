import axios from "axios";

const fetchPost = async ({queryKey}) => {

    const [_, postId] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/${postId}`,
    )

    return response.data;
}

export default fetchPost;