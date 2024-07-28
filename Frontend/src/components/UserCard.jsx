import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

const UserCard = ({authorId, picture, username, role}) => {
    return (
    <div className="flex w-[200px] gap-4 items-center">
        <NavLink to={`/user/${authorId}`}>
            <img className="object-cover w-10 h-10 rounded-full" src={picture} alt="author-pic" />
        </NavLink>
        <div className='flex flex-col'>
            <NavLink to={`/user/${authorId}`}>
                <h1 className='text-xl hover:text-primary-500'>{username}</h1>
            </NavLink>
            <h3 className='text-sm font-primaryLight'>{role}</h3>
        </div>
    </div>
  )
};

UserCard.propTypes = {
    authorId: PropTypes.string,
    picture: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
};

export default UserCard;