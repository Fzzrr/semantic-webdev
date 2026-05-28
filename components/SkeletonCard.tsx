// components/SkeletonCard.tsx
export default function SkeletonCard() {
  return (
    <div className="border border-[#1e1e2e] bg-[#111118] rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-5 h-5 rounded" />
          <div className="skeleton w-28 h-4 rounded" />
        </div>
        <div className="skeleton w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="skeleton w-full h-3 rounded" />
        <div className="skeleton w-4/5 h-3 rounded" />
      </div>
      <div className="flex justify-between items-center">
        <div className="skeleton w-12 h-3 rounded" />
        <div className="skeleton w-16 h-3 rounded" />
      </div>
    </div>
  );
}
