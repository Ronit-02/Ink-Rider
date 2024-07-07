import { useQuery } from "@tanstack/react-query";
import fetchAllPost from "../api/fetchAllPost";
import PostCard from "./PostCard";

const AllPostSection = () => {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post"],
    queryFn: fetchAllPost,
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError)
    return <div>{error?.response?.data?.message || error.message}</div>

  return (
    <div className="w-full">
      <h1 className="text-2xl">Featured Posts</h1>
      <div className="flex flex-row flex-wrap gap-4 mt-6">
        {data && 
        data.map((item) => (
          <PostCard
            key = {item._id}
            image={item.coverImage}
            id = {item._id}
            title={item.title}
            author={item.author.username}
            tags={item.tags}
          />
        ))}
      </div>
    </div>
  );
};

export default AllPostSection;