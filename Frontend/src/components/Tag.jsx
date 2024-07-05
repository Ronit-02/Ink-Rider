import { PropTypes } from 'prop-types'

const Tag = ({tag}) => {
  return (
    <div className='px-3 py-1 text-xs text-gray-700 capitalize bg-gray-200 border-2 rounded-3xl'>
        {tag}
    </div>
  )
}

Tag.propTypes = {
    tag: PropTypes.string,
}

export default Tag;