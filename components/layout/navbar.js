import Link from "next/link";
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Smart Tourism Platform
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {PUBLIC_ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {route.label}
            </Link>
          ))}
          {PRIVATE_ROUTES.map((route) => (
            <Link key={route.href} href={route.href} className="text-sm font-medium text-slate-600 hover:text-slate-900">
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="secondary" className="hidden sm:inline-flex">
            <Link href="/login">Login</Link>
          </Button>
          <Button>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
