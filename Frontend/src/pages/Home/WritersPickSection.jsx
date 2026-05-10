/* WritersPickSection — small card grid */
import { useNavigate } from 'react-router-dom'
import { articles } from '@/data'
import SectionHeading from '@/components/ui/SectionHeading'
import AuthorMeta from '@/components/ui/AuthorMeta'
import Button from "@/components/ui/Button";

export default function WritersPickSection() {
  const navigate = useNavigate()
  
  return (
    <div className="fade-in fade-in-3 mb-13">
      <div className="flex items-center justify-between mb-7">
        <SectionHeading>Writer's Picks</SectionHeading>
        <Button variant="secondary" onClick={() => navigate("/explore/trending")}>
          View Trending →
        </Button>
      </div>
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}
      >
        {articles.slice(7, 11).map((a) => (
          <div
            key={a.id}
            className="hover-lift cursor-pointer bg-(--color-surface) rounded-[14px]
            border border-(--color-border) overflow-hidden"
            onClick={() => navigate(`/post/${a.id}`)}
          >
            <img
              src={a.image}
              alt={a.title}
              className="w-full h-32.5 object-cover block"
            />
            <div className="p-3">
              <AuthorMeta author={a.author} size="sm" />
              <h3
                className="font-bold text-[13px] text-(--color-text) leading-[1.4] mt-2 mb-1 line-clamp-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {a.title}
              </h3>
              <p className="text-[12px] text-(--color-text-muted)">
                {a.readTime}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
