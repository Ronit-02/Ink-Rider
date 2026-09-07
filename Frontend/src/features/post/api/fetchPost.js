import api from "@/app/api";

const fetchPost = async ({queryKey}) => {

    const [, postId] = queryKey;

    const response = await api.get(
        `/api/post/${postId}`,
    )

    return response.data.postData;
}

export default fetchPost;
