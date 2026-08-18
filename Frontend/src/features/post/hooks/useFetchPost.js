import { useQuery } from "@tanstack/react-query";
import { useSelector } from 'react-redux'
import fetchPost from "../api/fetchPost";

export default function useFetchPost(postId) {
    const token = useSelector(state => state.auth.token)

    return useQuery({
        // The detail response includes reader-specific like/save state. Split
        // the cache by authentication so a public request made during session
        // restoration cannot remain authoritative after the refresh succeeds.
        queryKey: ['post', postId, token ? 'authenticated' : 'anonymous'],
        queryFn: fetchPost,
        retry: 1    // limited retries (faster reload)
    })
}
