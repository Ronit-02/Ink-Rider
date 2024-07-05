import axios from "axios";

const fetchPost = async ({queryKey}) => {

    const [_, id] = queryKey;

    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/post/:${id}`,
    )

    return response.data;
}

export default fetchPost;