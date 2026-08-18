import DiscoveryPostCard from './DiscoveryPostCard'

// Single short-read presentation used by Search and the Short Reads page.
export default function ShortCard({ post, onOpen }) {
  return <DiscoveryPostCard post={post} variant="short" onOpen={onOpen} />
}
