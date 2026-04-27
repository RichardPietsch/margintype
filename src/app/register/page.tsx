import Link from "next/link";
import { AuthCard } from "@/components/ui/AuthCard";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <AuthCard title="Registrieren">
        <form action="/api/auth/register" method="post" className="space-y-3">
          <input name="name" type="text" placeholder="Name" className="input" required />
          <input name="email" type="email" placeholder="E-Mail" className="input" required />
          <input name="password" type="password" placeholder="Passwort" className="input" required />
          <button className="btn btn-primary w-full">Konto erstellen</button>
        </form>
        <p className="mt-4 text-sm text-zinc-600">Bereits ein Konto? <Link href="/login" className="underline">Anmelden</Link></p>
      </AuthCard>
    </div>
  );
}
