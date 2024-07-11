import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import searchPost from "../api/search/searchPost";
import searchCategory from "../api/search/searchCategory";
import searchUser from "../api/search/searchUser";
import PostCard from "../components/PostCard";
import UserCard from "../components/UserCard";

const SearchPage = () => {
  // Extracting parameters
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Posts");

  useEffect(() => {
    setQuery(searchParams.get("query") || "");
    setFilter(searchParams.get("filter") || "Posts");
  }, [searchParams]);

  // Searching Posts
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["post", { query, filter }],
    queryFn:
      filter === "posts"
        ? searchPost
        : filter === "category"
        ? searchCategory
        : searchUser,
    retry: 1   // limited retries, faster reload
  });

  useEffect(() => {
    console.log(data);
  }, [data]);

  // Conditional Rendering
  if (query === "") return <div>Enter query to search</div>;
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>{error?.response?.data?.message}</div>;
  else
    return (
      <div className="w-full">
        <h1 className="text-2xl">Search Results</h1>
        <div className="flex flex-row flex-wrap gap-4 mt-6">
        {
            data[0] ?
            (
                filter === 'author' ?
                (
                    data.map((item) => (
                        <UserCard
                            key={item._id}
                            username={item.username}
                            role={item.role}
                        />
                    ))
                ) : 
                (
                    data.map((item) => (
                        <PostCard
                            key={item._id}
                            image={item.coverImage}
                            id={item._id}
                            title={item.title}
                            author={item.author.username}
                            authorId={item.author._id}
                            tags={item.tags}
                        />
                    ))
                )
            ) :
            (
                <div>No Results Found</div>
            )
        }
        </div>
      </div>
    );
};

export default SearchPage;
