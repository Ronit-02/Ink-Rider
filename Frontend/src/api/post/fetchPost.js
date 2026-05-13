import api from "../api.js";

const fetchPost = async ({queryKey}) => {

    const [_, postId] = queryKey;

    const response = await api.get(
        `/api/post/${postId}`,
    )

    return response.data;
}

export default fetchPost;