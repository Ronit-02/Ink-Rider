import { useQuery } from "@tanstack/react-query";
import { useSelector } from 'react-redux'
import fetchPost from "../api/fetchPost";

export default function useFetchPost(postId) {
    const token = useSelector(state => state.auth.token)
    const isAuthReady = useSelector(state => state.auth.isReady)

    return useQuery({
        // The detail response includes reader-specific like/save state. Split
        // the cache by authentication so a public request made during session
        // restoration cannot remain authoritative after the refresh succeeds.
        queryKey: ['post', postId, token ? 'authenticated' : 'anonymous'],
        queryFn: fetchPost,
        // Article responses include reader-specific save and appreciation state.
        // Wait for refresh-cookie restoration so a reload cannot settle the
        // detail query with the anonymous representation first.
        enabled: Boolean(postId) && isAuthReady,
        retry: 1    // limited retries (faster reload)
    })
}
