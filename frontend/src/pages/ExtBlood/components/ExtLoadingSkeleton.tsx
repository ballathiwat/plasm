// frontend/src/pages/ExtBlood/components/ExtLoadingSkeleton.tsx
export default function ExtLoadingSkeleton() {
  return (
    <div className="ext-skeleton-wrap">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="ext-skeleton-row">
          <div className="ext-skeleton ext-skeleton--sm" />
          <div className="ext-skeleton ext-skeleton--md" />
          <div className="ext-skeleton ext-skeleton--lg" />
          <div className="ext-skeleton ext-skeleton--sm" />
          <div className="ext-skeleton ext-skeleton--sm" />
        </div>
      ))}
    </div>
  )
}
