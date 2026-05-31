import { useMutation, useQueryClient } from "@tanstack/react-query";
import bookmarkPost from "../api/bookmarkPost";

export default function useBookmarkPost(postId) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: bookmarkPost,
        onSuccess: (data) => {
            queryClient.setQueryData(['post', postId], 
                (oldData) => {
                    if(!oldData) return oldData;
                    return {
                        ...oldData,
                        isBookmarked: data.isBookmarked
                    }
                }
            )
        },
        onError: (error) => {
            console.error("Bookmarking failed: ", error);
        }
    })
}