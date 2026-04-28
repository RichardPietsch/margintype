import type { Metadata } from "next";
import { Noto_Serif } from "next/font/google";
import "./globals.css";

const manuscriptFont = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-manuscript",
  display: "block"
});

export const metadata: Metadata = {
  title: "MarginType",
  description: "Elegante Schreibumgebung für Autor:innen"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={manuscriptFont.variable} suppressHydrationWarning>{children}</body>
    </html>
  );
}
