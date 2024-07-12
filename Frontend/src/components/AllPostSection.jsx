import { useQuery } from "@tanstack/react-query";
import fetchAllPost from "../api/fetchAllPost";
import PostCard from "./PostCard";
import { useState } from "react";

const AllPostSection = () => {

  const [sort, setSort] = useState('views')
  const [sortType, setSortType] = useState('ascending')
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", sort, sortType],
    queryFn: fetchAllPost,
  });

  // Conditional Rendering
  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>{error?.response?.data?.message || error.message}</div>
  else
  return (
    <div className="w-full">
      <div className="flex justify-between">
        <h1 className="text-2xl">All Posts</h1>
        <div className="flex gap-4">
          <select className="flex-none px-4 py-2 border" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="views">views</option>
            <option value="likes">likes</option>
            <option value="date">date</option>
          </select>
          <select className="flex-none px-4 py-2 border" value={sortType} onChange={(e) => setSortType(e.target.value)}>
            <option value="ascending">ascending</option>
            <option value="descending">descending</option>
          </select>
        </div>
      </div>
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
  );
};

export default AllPostSection;