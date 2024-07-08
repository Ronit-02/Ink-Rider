import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";

const PostCard = ({ image, id, title, author, tags }) => {
  return (
    <NavLink to={`/post/${id}`} className="w-[300px] gap-2 flex flex-col">
      <img src={image} alt="coverImage" className="w-full h-[150px]" />
      <h3>{author}</h3>
      <h1 className="text-2xl font-bold text-gray-600 capitalize">{title}</h1>
      <ul className="flex gap-4">
        {tags.map((tag) => (
          <Tag key={tag} tag={tag} />
        ))}
      </ul>
    </NavLink>
  );
};

PostCard.propTypes = {
  id: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
  author: PropTypes.string,
  tags: PropTypes.array,
};

export default PostCard;