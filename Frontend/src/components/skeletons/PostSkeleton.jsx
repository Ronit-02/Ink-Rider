import PropTypes from "prop-types";

const PostSkeleton = ({count = 2}) => {
  return (
    <div className="flex flex-wrap gap-8 animate-pulse">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="flex bg-white flex-col gap-4 w-[250px] p-4 border-2 border-gray-100 rounded-xl">
                <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                    <div className="w-[100px] h-[20px] bg-gray-100"></div>
                </div>
                <div className="w-full h-[100px] bg-gray-100"></div>
                <div className="w-full h-[10px] bg-gray-100"></div>
                <div className="w-1/2 h-[10px] bg-gray-100"></div>
            </div>
        ))}
    </div>
  )
}

PostSkeleton.propTypes = {
    count: PropTypes.number,
}

export default PostSkeleton;