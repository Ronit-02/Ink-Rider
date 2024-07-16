import { useQuery } from "@tanstack/react-query";
import fetchProfileAndPosts from "../../api/profile/fetchProfileWithPosts";
import PostListCard from "../../components/PostListCard";

const ProfilePostsPage = () => {
    
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["user"],
        queryFn: fetchProfileAndPosts,
    });

    // Conditonal Rendering
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>{error?.response?.data?.message || error.message}</div>;

    return (
    <section>
        <h1 className="text-2xl">Your Posts</h1>
        <div className="flex flex-row flex-wrap">
            {data.posts &&
                data.posts.map((item) => (
                <PostListCard
                    key={item._id}
                    image={item.coverImage}
                    id={item._id}
                    title={item.title}
                    tags={item.tags}
                    content={item.body}
                    owner={true}
                />
            ))}
            {data.posts[0] === undefined && <div>No posts yet</div>}
        </div>
      </section>
  )
}

export default ProfilePostsPage;