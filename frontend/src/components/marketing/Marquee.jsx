export default function Marquee({ items, dark = false, fast = false }) {
  const row = items.map((item, i) => (
    <span key={i} className="mx-6 flex items-center gap-6 whitespace-nowrap">
      <span className={`font-display text-2xl md:text-4xl font-extrabold tracking-tight ${dark ? "text-white" : "text-obsidian"}`}>
        {item}
      </span>
      <span className="h-2.5 w-2.5 rounded-full bg-fox" />
    </span>
  ));

  return (
    <div
      className={`relative overflow-hidden border-y py-6 ${dark ? "border-white/10 bg-obsidian" : "border-black/5 bg-white"}`}
      data-testid="editorial-marquee"
    >
      <div className={`flex w-max ${fast ? "animate-marquee-fast" : "animate-marquee"}`}>
        <div className="flex">{row}</div>
        <div className="flex" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
