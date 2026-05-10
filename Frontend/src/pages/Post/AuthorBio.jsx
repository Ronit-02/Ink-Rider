/* AuthorBio — author card at bottom of post with follow button */
import { useNavigate } from 'react-router-dom'
import Button from '@/components/ui/Button'
import Divider from '@/components/ui/Divider'

export default function AuthorBio({ author }) {
  const navigate = useNavigate()
  return (
    <>
      <Divider className="my-8" />
      <div className="flex gap-4 p-6 bg-[var(--color-bg-alt)] rounded-[20px]">
        <img src={author.avatar} alt={author.name}
          className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
        <div>
          <p className="font-bold text-[14px] mb-1 text-[var(--color-text)]">{author.name}</p>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6]">{author.bio}</p>
          <div className="flex gap-2 mt-3">
            <Button variant="secondary" className="text-[12px]"
              onClick={() => navigate('/author')}>View Profile</Button>
            <Button variant="primary" className="text-[12px]">Follow</Button>
          </div>
        </div>
      </div>
    </>
  )
}
