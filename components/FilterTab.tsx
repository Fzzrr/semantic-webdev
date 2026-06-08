"use client";

// Pull-tab yang menempel di tepi kiri layar (hanya < lg, saat sidebar dalam mode
// drawer). Diklik untuk menggeser keluar filter kategori. Desain minimal: ikon
// filter + chevron sebagai petunjuk arah, tanpa teks vertikal yang sempit.
export default function FilterTab({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka filter kategori"
      className="md:hidden fixed left-0 top-28 z-30 flex flex-col items-center gap-1.5 bg-[#1b1b1b]/95 backdrop-blur-sm border border-l-0 border-[#333333] text-[#c3c6d7] rounded-r-2xl py-3.5 pl-2.5 pr-3 shadow-xl shadow-black/40 transition-all duration-200 hover:text-[#b4c5ff] hover:border-[#2563eb]/50 hover:pr-4 active:scale-95"
    >
      <span className="material-symbols-outlined text-[20px]">tune</span>
      <span className="material-symbols-outlined text-[14px] opacity-50">chevron_right</span>
    </button>
  );
}
