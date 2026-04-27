import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Anmelden">
        <form action="/api/auth/login" method="post" className="space-y-3">
          <input name="email" type="email" placeholder="E-Mail" className="input" required />
          <input name="password" type="password" placeholder="Passwort" className="input" required />
          <button className="btn btn-primary w-full">Anmelden</button>
        </form>
        <p className="mt-4 text-sm text-zinc-600">Neu hier? <Link href="/register" className="underline">Registrieren</Link></p>
      </AuthCard>
    </div>
  );
}
