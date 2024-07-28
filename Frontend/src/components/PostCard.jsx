import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import Tag from "./Tag";

// Icons
import { FaRegHeart } from "react-icons/fa";
import { FaRegComment } from "react-icons/fa6";
import { FaRegBookmark } from "react-icons/fa";

const PostCard = ({ image, id, date, title, author, authorPic, authorId, tags, likes, comments}) => {

    return (
        <div className="w-[350px] gap-2 flex flex-col">
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <NavLink className="flex items-center w-8 h-8 gap-2" to={`/user/${authorId}`}>
                        <img className="object-cover w-8 h-8 rounded-full" src={authorPic} alt="author-pic" />
                    </NavLink>
                    <div className="flex flex-col">
                        <NavLink className="flex items-center gap-2 w-fit h-fit" to={`/user/${authorId}`}>
                            <p className="text-md">{author}</p>
                        </NavLink>
                        <div className="flex gap-1 text-xs text-gray-600">
                            <p>
                                { new Date(date).toLocaleString('en-GB', {day:'numeric', month: 'long'})}
                            </p>
                            •
                            <p>
                                3 min read
                            </p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button className="h-fit">
                            <FaRegHeart className="text-xl text-gray-600" />
                        </button>
                        <p className="text-sm font-primaryLight">
                            {likes}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="h-fit">
                            <FaRegComment className="text-xl text-gray-600" />
                        </button>
                        <p className="text-sm font-primaryLight">
                            {comments}
                        </p>
                    </div>
                    <div className="flex items-center gap-1">
                        <button className="h-fit">
                            <FaRegBookmark className="text-xl text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>
            <NavLink to={`/post/${id}`}>
                <img src={image} alt="coverImage" className="object-cover rounded-md w-full h-[200px]" />
            </NavLink>
            <h1 className="text-2xl tracking-tight capitalize font-primarySemiBold">{title}</h1>
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
    date: PropTypes.any,
    image: PropTypes.string,
    title: PropTypes.string,
    author: PropTypes.string,
    authorPic: PropTypes.string,
    authorId: PropTypes.string,
    tags: PropTypes.array,
    likes: PropTypes.number,
    comments: PropTypes.number,
};

export default PostCard;