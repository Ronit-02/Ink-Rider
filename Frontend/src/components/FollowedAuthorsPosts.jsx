import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import PostCard from "./PostCard";

const fetchFollowedAuthorPosts = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/user/followed-posts`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
}

const FollowedAuthorsPosts = () => {

    const { data, isLoading, isError } = useQuery({
        queryKey: ["post"],
        queryFn: fetchFollowedAuthorPosts,
        retry: 1   // faster load
    });

    // Conditional Rendering
    if (isLoading) return <div>Loading...</div>
    if (isError) return null;
    return (
    <div className="w-full">
        <h1 className="text-2xl">From Authors you Follow</h1>
        <div className="flex flex-row flex-wrap gap-8 mt-8">
        {
            data[0] ? 
            data.map((item) => (
            <PostCard
                key = {item?._id}
                image={item?.coverImage}
                id = {item?._id}
                title={item?.title}
                author={item?.author?.username}
                authorPic={item?.author?.picture}
                authorId = {item?.author?._id}
                tags={item?.tags}
            />)) :
            <div>No posts yet</div>
        }
        </div>
    </div>
    )
}

export default FollowedAuthorsPosts;