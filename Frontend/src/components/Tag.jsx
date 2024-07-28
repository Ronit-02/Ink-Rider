import { PropTypes } from 'prop-types'

const Tag = ({tag}) => {
  return (
    <div className='px-3 py-1 text-xs capitalize bg-gray-100 rounded-3xl'>
        {tag}
    </div>
  )
}

Tag.propTypes = {
    tag: PropTypes.string,
}

export default Tag;