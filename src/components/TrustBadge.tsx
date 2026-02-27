type TrustBadgeProps = {
  icon: "fleet" | "quality" | "support" | "usa";
  title: string;
  description: string;
};

const icons = {
  fleet: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  quality: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  support: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  usa: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M12 12a4 4 0 004-4V8a2 2 0 00-4 0v4a4 4 0 004 4z" />
    </svg>
  ),
};

export default function TrustBadge({ icon, title, description }: TrustBadgeProps) {
  return (
    <div className="flex gap-5 p-6 sm:p-7 rounded-2xl border border-black/5 dark:border-white/5 bg-white dark:bg-white/[0.03] hover:border-black/10 dark:hover:border-white/10 transition-colors">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#3b82f6]/10 dark:bg-[#60a5fa]/15 flex items-center justify-center text-[#3b82f6] dark:text-[#60a5fa]" aria-hidden>
        {icons[icon]}
      </div>
      <div className="min-w-0">
        <h3 className="font-semibold text-lg text-black dark:text-white">{title}</h3>
        <p className="text-sm sm:text-base text-black/65 dark:text-white/65 mt-1.5 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
