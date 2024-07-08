import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";
import { useMutation } from "@tanstack/react-query";
import deletePost from "../api/deletePost";

const PostListCard = ({ image, id, title, tags, content }) => {
  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: deletePost,
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error.message);
    },
  });

  if (isLoading) return <div>Deleting this post..</div>;

  if (isError)
    console.log("Error - ", error?.respone?.data?.message || error.message);

  const handleDeletePost = () => {
    mutate({ id });
  };

  return (
    <div className="flex flex-row w-full h-[200px] gap-6 max-w-[900px]">
      <NavLink to={`/post/${id}`} className="flex flex-row flex-auto gap-6">
        <img
          src={image}
          alt="coverImage"
          className="flex-none w-[250px] h-3/4 my-auto"
        />
        <div className="flex-auto flex flex-col gap-4 w-[300px] justify-center">
          <h1 className="text-2xl font-bold text-gray-600 capitalize">
            {title}
          </h1>
          <ul className="flex gap-4">
            {tags.map((tag) => (
              <Tag key={tag} tag={tag} />
            ))}
          </ul>
          <p className="line-clamp-2">{content}</p>
        </div>
      </NavLink>
      <div className="flex items-center flex-none gap-4 pr-4 w-fit">
        <button onClick={handleDeletePost}>Delete</button>
        <NavLink to={`/post-edit/${id}`}>Edit</NavLink>
      </div>
    </div>
  );
};

PostListCard.propTypes = {
  id: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  tags: PropTypes.array,
  content: PropTypes.string,
};

export default PostListCard;