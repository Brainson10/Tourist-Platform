export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/80 py-8 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <p>© 2026 Smart Tourism Platform. Foundation scaffold for Northeast India tourism experiences.</p>
        <div className="flex gap-4">
          <a href="/about" className="hover:text-slate-900">About</a>
          <a href="/contact" className="hover:text-slate-900">Contact</a>
        </div>
      </div>
    </footer>
  );
}
