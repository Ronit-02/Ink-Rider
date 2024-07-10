import PropTypes from 'prop-types';

const UserCard = ({username, role}) => {
  return (
    <div className="flex flex-col w-[200px]">
        <h1 className='text-xl'>{username}</h1>
        <h3 className='text-sm text-gray-500'>{role}</h3>
    </div>
  )
};

UserCard.propTypes = {
    username: PropTypes.string,
    role: PropTypes.string,
};

export default UserCard;