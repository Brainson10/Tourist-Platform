import { Container } from "@/components/ui/container";

export function AuthCard({ title, description, children, footer }) {
  return (
    <Container size="narrow" className="py-12 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-ink-muted">{description}</p> : null}
        <div className="mt-6 rounded-xl border border-line bg-surface p-6">{children}</div>
        {footer ? <p className="mt-4 text-center text-sm text-ink-muted">{footer}</p> : null}
      </div>
    </Container>
  );
}
