import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import searchPost from "../../api/search/searchPost";
import searchCategory from "../../api/search/searchCategory";
import searchUser from "../../api/search/searchUser";
import PostCard from "../../components/PostCard";
import UserCard from "../../components/UserCard";

// Icons
import { IoIosSearch } from "react-icons/io";

// Skeletons
import SearchSkeleton from "../../components/skeletons/SearchSkeleton";

const SearchPage = () => {

    // Extracting parameters
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("");

    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        setQuery(searchParams.get("query") || "");
        setFilter(searchParams.get("filter") || "posts");
        setSearchQuery(searchParams.get("query") || "");
    }, [searchParams]);


    // Searching Posts
    const { data, isLoading: postIsLoading, isError, error } = useQuery({
        queryKey: ["post", { query: searchQuery, filter }],
        queryFn:
        filter === "posts"
            ? searchPost
            : filter === "tags"
            ? searchCategory
            : searchUser,
        enabled: searchQuery !== ''
    });

    
    const handleKeyDown = (e) => {
        if(e.key === 'Enter'){
            e.preventDefault();
            // setSearchQuery(query);
            navigate(`/search?query=${query}&filter=${filter}`);
        }
    }


    // Conditional Rendering
    const renderContent = () => {

        if(searchQuery === ''){
            return <div>Enter query to Search</div>
        }

        if(postIsLoading){
            return (
                <SearchSkeleton count={3} />
            )
        }

        if(isError){
            return <div>{error?.response?.data?.message || error.message}</div>;
        }

        if(data && data.length > 0){
            return filter === 'authors' 
            ? (
                data.map((item) => (
                    <UserCard
                        key={item._id}
                        authorId={item._id}
                        picture={item.picture}
                        username={item.username}
                        role={item.role}
                    />
                ))
            ) 
            : (
                data.map((item) => (
                    <PostCard
                        key={item?._id}
                        id={item?._id}
                        image={item?.coverImage}
                        title={item?.title}
                        date={item?.createdAt}
                        author={item?.author?.username}
                        authorPic={item?.author?.picture}
                        authorId={item?.author?._id}
                        tags={item?.tags}
                        likes={item?.likes}
                        comments={item?.comments.length}
                    />
                ))
            )
        }

        return <div>No results found</div>
    }

    return (
    <div className="flex flex-col w-full gap-4 p-4">
        <div 
            className="flex border-[1px] border-gray-300 rounded-3xl gap-2 items-center py-2 px-4 w-full text-md"
            onKeyDown={handleKeyDown}
            >
            <IoIosSearch className="flex-none text-xl text-gray-500" />
            <input 
                className="flex-auto w-full focus:outline-none placeholder:text-gray-400 placeholder:font-primaryLight" 
                placeholder="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <div className="flex gap-8">
            <button 
                className={`${filter === 'posts' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                onClick={() => navigate(`/search?query=${query}&filter=posts`)}>
                Posts
            </button>
            <button 
                className={`${filter === 'tags' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                onClick={() => navigate(`/search?query=${query}&filter=tags`)}>
                Tags
            </button>
            <button 
                className={`${filter === 'authors' && 'bg-primary-100 text-primary-500'} p-2 text-sm capitalize rounded-lg hover:bg-primary-100 hover:text-primary-500`}
                onClick={() => navigate(`/search?query=${query}&filter=authors`)}>
                Authors
            </button>
        </div>

        <div className="flex flex-row flex-wrap gap-4 mt-6">
            {renderContent()}
        </div>
    </div>
    );
};

export default SearchPage;