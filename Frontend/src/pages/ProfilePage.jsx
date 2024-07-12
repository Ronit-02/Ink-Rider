import { useQuery } from "@tanstack/react-query";
import PostListCard from "../components/PostListCard";
import profileImage from "../assets/images/Profile-Pic.svg";
import fetchProfileAndPosts from "../api/fetchProfileWithPosts";

const ProfilePage = () => {
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
        <img className="w-16 h-16 rounded-full" src={data?.picture || profileImage} alt="profile-pic" />
        <div className="flex flex-col">
          <h1 className="text-2xl capitalize">{data.username}</h1>
          <h3 className="text-sm text-gray-500">{data.role} user</h3>
        </div>
      </div>
      <section className="mt-4">
        <h1 className="text-2xl">Saved Posts</h1>
        <div className="flex flex-row flex-wrap gap-4 mt-6">
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
          {data.posts[0] === undefined && <div>No posts yet</div>}
        </div>
      </section>
      <section className="mt-4">
        <h1 className="text-2xl">Liked Posts</h1>
        <div className="flex flex-row flex-wrap gap-4 mt-6">
          {data.likedPosts &&
            data.likedPosts.map((item) => (
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
          {data.posts[0] === undefined && <div>No posts yet</div>}
        </div>
      </section>
      <section className="mt-4">
        <h1 className="text-2xl">Your Posts</h1>
        <div className="flex flex-row flex-wrap gap-4 mt-6">
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
    </div>
  );
};

export default ProfilePage;