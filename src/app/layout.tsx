import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarginType",
  description: "Elegante Schreibumgebung für Autor:innen"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
