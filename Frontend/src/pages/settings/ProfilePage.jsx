import { useQuery } from "@tanstack/react-query";

import PostListCard from "../../components/PostListCard";
import profileImage from "../../assets/images/Profile-Pic.svg";
import fetchProfileAndPosts from "../../api/profile/fetchProfileWithPosts";

const ProfilePage = () => {
  
    // Fetching Profile and Posts
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["user"],
        queryFn: fetchProfileAndPosts,
    });
  
    // Conditonal Rendering
    if (isLoading) return <div>Loading...</div>;
    if (isError) return <div>{error?.response?.data?.message || error.message}</div>;

  return (
    <div className="w-full h-full">
        <div className="flex items-center gap-4">
            <img className="object-cover w-16 h-16 rounded-full" src={data?.picture || profileImage} alt="profile-pic" />
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl capitalize">{data.username}</h1>
                <h3 className="text-sm text-gray-500">{data.role} user</h3>
            </div>
        </div>
        <section className="mt-8">
            <h1 className="text-2xl">Saved Posts</h1>
            <div className="flex flex-row flex-wrap gap-4">
            {data.savedPosts &&
                data.savedPosts.map((item) => (
                <PostListCard
                    key={item._id}
                    image={item.coverImage}
                    id={item._id}
                    title={item.title}
                    tags={item.tags}
                    content={item.body}
                    owner={false}
                />
                ))}
            {data.savedPosts[0] === undefined && <div className="mt-4">No posts yet</div>}
            </div>
        </section>
    </div>
  );
};

export default ProfilePage;