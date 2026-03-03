export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-slate/5 dark:bg-brand-black">
      {children}
    </div>
  );
}
