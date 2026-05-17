/* CollectionsSection — preview of collections on home page */
import { useNavigate } from "react-router-dom";
import { collections } from "@/shared/data";
import SectionHeading from "@/shared/components/ui/SectionHeading";

function CollectionCard({ collection }) {
  const navigate = useNavigate();
  return (
    <div className="hover-lift rounded-md border border-(--color-border) overflow-hidden flex cursor-pointer min-h-35"
      onClick={() => navigate(`/collections/${collection.id}`)}>
      
      {/* Text */}
      <div className="flex-1 p-5">
        {collection.curator ? (
          <div className="flex items-center gap-2 mb-2.5">
            <img
              src={collection.curator.avatar}
              alt={collection.curator.name}
              className="w-7 h-7 rounded-full object-cover"
            />
            <span className="text-[13px] font-semibold text-(--color-text)">
              {collection.curator.name}
            </span>
          </div>
        ) : (
          <h3
            className="font-bold text-[16px] text-(--color-text) mb-2 leading-[1.3]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {collection.title}
          </h3>
        )}
        <p className="text-[12px] text-(--color-text-secondary) leading-[1.55] line-clamp-3 mb-3">
          {collection.description}
        </p>
        <span className="text-[12px] text-(--color-text-muted) font-medium">
          {collection.stories} Stories
        </span>
      </div>
      
      {/* Image */}
      <div className="w-35 shrink-0">
        <img
          src={collection.image}
          alt={collection.title}
          loading="lazy"
          className="w-full h-full object-cover block"
        />
      </div>
    </div>
  );
}

export default function CollectionsSection() {
  return (
    <div className="fade-in fade-in-2 mb-13">
      <SectionHeading className="mb-9">Browse Collections</SectionHeading>
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))" }}
      >
        {collections.map((col) => (
          <CollectionCard key={col.id} collection={col} />
        ))}
      </div>
    </div>
  );
}
