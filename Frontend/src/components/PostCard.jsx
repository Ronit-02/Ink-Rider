import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";

const PostCard = ({ image, id, title, author, authorId, tags }) => {
  return (
    <div className="w-[300px] gap-2 flex flex-col">
      <NavLink to={`/post/${id}`}>
        <img src={image} alt="coverImage" className="w-full h-[150px]" />
      </NavLink>
      <NavLink to={`/user/${authorId}`}>{author}</NavLink>
      <h1 className="text-2xl font-bold text-gray-600 capitalize">{title}</h1>
      <ul className="flex gap-4">
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </ul>
    </div>
  );
};

PostCard.propTypes = {
  id: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  authorId: PropTypes.string,
  tags: PropTypes.array,
};

export default PostCard;