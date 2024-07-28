import PropTypes from "prop-types";

const PostSkeleton = ({count = 2}) => {
  return (
    <div className="flex flex-col gap-12 animate-pulse">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
            <div className="h-[15px] w-[150px] bg-gray-100 rounded-2xl"></div>
            <div className="flex flex-col gap-2">
                <div className="h-[10px] w-[200px] bg-gray-100 rounded-2xl"></div>
                <div className="h-[10px] w-[200px] bg-gray-100 rounded-2xl"></div>
            </div>
            </div>
        ))}
    </div>
  )
}

PostSkeleton.propTypes = {
    count: PropTypes.number,
}

export default PostSkeleton;