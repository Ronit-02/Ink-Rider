import api from "@/app/api";

const bookmarkPost = async ({postId}) => {

    const response = await api.post(
        `/api/post/bookmark/${postId}`,
    )

    return response.data;
}

export default bookmarkPost;