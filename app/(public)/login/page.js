import { LoginForm } from "@/components/auth/login-form";
import { PageShell } from "@/components/shared/page-shell";

export const metadata = {
  title: "Login",
  description: "Sign in to the Smart Tourism Platform.",
};

export default function LoginPage() {
  return (
    <PageShell title="Login" description="Access your tourism workspace and administration tools.">
      <div className="max-w-xl">
        <LoginForm />
      </div>
    </PageShell>
  );
}
