import api from "@/app/api";

const bookmarkPost = async ({ postId, isBookmarked }) => {

    const response = await api.request({
        method: isBookmarked ? 'put' : 'delete',
        url: `/api/post/${postId}/bookmark`,
    });

    return response.data;
}

export default bookmarkPost;
