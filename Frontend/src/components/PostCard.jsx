import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";

const PostCard = ({ image, id, title, author, authorPic, authorId, tags }) => {
  return (
    <div className="w-[300px] gap-2 flex flex-col">
      <NavLink to={`/post/${id}`}>
        <img src={image} alt="coverImage" className="object-cover w-full h-[150px]" />
      </NavLink>
      <NavLink className="flex items-center gap-2" to={`/user/${authorId}`}>
        <img className="w-6 h-6 rounded-full" src={authorPic} alt="author-pic" />
        <p className="lowercase text-md">{author}</p>
      </NavLink>
      <h1 className="text-2xl font-bold text-gray-600 capitalize">{title}</h1>
      <ul className="flex flex-wrap gap-2">
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
  authorPic: PropTypes.string,
  authorId: PropTypes.string,
  tags: PropTypes.array,
};

export default PostCard;