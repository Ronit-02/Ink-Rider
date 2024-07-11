import { useQuery } from "@tanstack/react-query";
import fetchAllPost from "../api/fetchAllPost";
import PostCard from "./PostCard";

const AllPostSection = () => {
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post"],
    queryFn: fetchAllPost,
  });

  // Conditional Rendering
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>{error?.response?.data?.message || error.message}</div>
  else
  return (
    <div className="w-full">
      <h1 className="text-2xl">Featured Posts</h1>
      <div className="flex flex-row flex-wrap gap-4 mt-6">
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
  );
};

export default AllPostSection;