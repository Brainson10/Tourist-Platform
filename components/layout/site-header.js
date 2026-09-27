import { Brand } from "@/components/layout/brand";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NavLinks } from "@/components/layout/nav-links";
import { UserMenu } from "@/components/layout/user-menu";
import { HeaderSearch } from "@/components/search/header-search";
import { ButtonLink } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { WeaveBorder } from "@/components/ui/weave";
import { getCurrentUser } from "@/lib/auth/session";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85">
      <WeaveBorder height={6} className="opacity-90" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Brand />
          <NavLinks />
        </div>
        <div className="flex items-center gap-2">
          <HeaderSearch />
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
          <div className="hidden lg:block">
            <ButtonLink href="/trips/new" variant="ghost" size="sm">
              Plan a trip
            </ButtonLink>
          </div>
          {user ? (
            <div className="hidden md:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <ButtonLink href="/login" variant="ghost" size="sm">
                Sign in
              </ButtonLink>
              <ButtonLink href="/signup" size="sm">
                Sign up
              </ButtonLink>
            </div>
          )}
          <MobileNav user={user} />
        </div>
      </div>
    </header>
  );
}
