"use client";
// components/StatusBanner.tsx

interface StatusBannerProps {
  isConnected: boolean | null;
}

export default function StatusBanner({ isConnected }: StatusBannerProps) {
  if (isConnected === true) return null;

  if (isConnected === null) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
      <div className="flex items-start gap-3">
        <span className="text-red-400 text-lg mt-0.5">⚠</span>
        <div>
          <p className="text-red-400 font-semibold text-sm mb-1">Apache Jena Fuseki not connected</p>
          <p className="text-[#8888aa] text-xs leading-relaxed">
            Make sure Fuseki is running on{" "}
            <code className="bg-[#1e1e2e] px-1.5 py-0.5 rounded text-orange-300">http://localhost:3030</code>{" "}
            and the dataset{" "}
            <code className="bg-[#1e1e2e] px-1.5 py-0.5 rounded text-orange-300">webdev</code>{" "}
            has been created with{" "}
            <code className="bg-[#1e1e2e] px-1.5 py-0.5 rounded text-orange-300">webdev.ttl</code>{" "}
            uploaded. See the <strong>README.md</strong> for setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
