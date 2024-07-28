import { useQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";
import fetchAllPosts from "../api/post/fetchAllPosts";
import PropTypes from "prop-types";

const AllPostSection = ({sort}) => {
    
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["post", sort],
        queryFn: fetchAllPosts,
    });

    // Conditional Rendering
    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>{error?.response?.data?.message || error.message}</div>

    return (
    <div className="w-full">
        <div className="flex flex-row flex-wrap gap-8 mt-8">
            {data[0] 
            ? data.map((item) => (
                <PostCard
                    key = {item?._id}
                    id = {item?._id}
                    image={item?.coverImage}
                    title={item?.title}
                    date={item?.createdAt}
                    author={item?.author?.username}
                    authorPic={item?.author?.picture}
                    authorId = {item?.author?._id}
                    tags={item?.tags}
                    likes={item?.likes}
                    comments={item?.comments.length}
                />)) 
            : <div>No posts yet</div>
            }
        </div>
    </div>
  );
};

AllPostSection.propTypes = {
    sort: PropTypes.string,
}

export default AllPostSection;