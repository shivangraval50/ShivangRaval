export default function Footer() {
  return (
    <footer className="border-t border-line-subtle px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 font-mono text-xs text-ink-tertiary sm:flex-row">
        <p>© {new Date().getFullYear()} Shivang Raval. Built with Next.js, Tailwind & Framer Motion.</p>
        <p>Deployed on Vercel</p>
      </div>
    </footer>
  );
}
