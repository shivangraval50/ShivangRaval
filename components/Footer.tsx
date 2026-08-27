export default function Footer() {
  return (
    <footer className="border-t border-line-subtle bg-void-surface px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-[0.8125rem] text-ink-tertiary sm:flex-row">
        <p>© {new Date().getFullYear()} Shivang Raval. Built with Next.js, Tailwind &amp; Framer Motion.</p>
        <p>Deployed on Vercel</p>
      </div>
    </footer>
  );
}
