import { useQuery } from "@tanstack/react-query";
import fetchPost from "../api/fetchPost";

export default function useFetchPost(postId) {
    return useQuery({
        queryKey: ['post', postId],
        queryFn: fetchPost,
        retry: 1    // limited retries (faster reload)
    })
}