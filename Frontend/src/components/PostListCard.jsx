import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import deletePost from "../api/deletePost";
import useNotification from "../components/notification/useNotification";
import useModal from "./modal/useModal";

const PostListCard = ({ image, id, title, tags, content, owner }) => {

  const { displayNotification } = useNotification();
  const { openModal } = useModal();
  const queryClient = useQueryClient();

  // Updating Post
  const { mutate, isLoading } = useMutation({
    mutationFn: deletePost,
    onSuccess: (respone) => {
      displayNotification(respone.message);
      queryClient.invalidateQueries(['user']);
    },
    onError: (error) => {
      displayNotification(error?.response?.data?.message || error.message, 'error');
    },
  });

  const handleDeletePost = () => {
    openModal({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this post?',
      onConfirm: () => {
        return mutate({ id });
      },
      onCancel: () => {
        return null;
      }
    })
  };

  return (
    <div className="flex flex-row w-full h-[200px] gap-6 max-w-[900px]">
      <NavLink to={`/post/${id}`} className="flex flex-row flex-auto gap-6">
        <img
          src={image}
          alt="coverImage"
          className="flex-none w-[250px] h-3/4 my-auto object-contain"
        />
        <div className="flex-auto flex flex-col gap-4 w-[300px] justify-center">
          <h1 className="text-2xl font-bold text-gray-600 capitalize line-clamp-2">
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
      {
      owner && 
      <div className="flex items-center flex-none gap-4 pr-4 w-fit">
        <button onClick={handleDeletePost} disabled={isLoading} >Delete</button>
        <NavLink to={`/post-edit/${id}`}>Edit</NavLink>
      </div>
      }
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
  owner: PropTypes.bool
};

export default PostListCard;