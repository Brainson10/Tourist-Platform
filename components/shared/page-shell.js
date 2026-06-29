import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Container } from "@/components/ui/container";

export function PageShell({ children, title, description }) {
  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(135deg,_#f8f5ef_0%,_#f5efe4_45%,_#eef6f2_100%)] text-slate-800">
      <Navbar />
      <main className="flex-1 py-10 sm:py-14">
        <Container>
          {(title || description) && (
            <div className="mb-8 max-w-3xl">
              {title ? <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h1> : null}
              {description ? <p className="mt-3 text-lg leading-8 text-slate-600">{description}</p> : null}
            </div>
          )}
          {children}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
