import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getSession } from "@/lib/session";
import { logout } from "@/app/actions/auth";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WorkFlow",
  description: "Kısa süreli işler için hızlı eşleşme platformu.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  return (
    <html lang="tr">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <div className="min-h-screen bg-sand text-ink">
          <header className="sticky top-0 z-20 border-b border-ink/10 bg-sand/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <span className="font-display text-2xl">WorkFlow</span>
                <span className="rounded-full bg-ink px-2 py-0.5 text-xs font-medium text-sand">
                  Beta
                </span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium">
                <Link href="/jobs" className="hover:text-ink/70">
                  İş İlanları
                </Link>
                {!session && (
                  <Link href="/auth" className="btn-primary">
                    Giriş / Kayıt
                  </Link>
                )}
                <Link href="/profile" className="hover:text-ink/70">
                  Profil
                </Link>
                {session?.role === "STUDENT" && (
                  <Link href="/applications" className="hover:text-ink/70">
                    Başvurularım
                  </Link>
                )}
                {session?.role === "EMPLOYER" && (
                  <Link href="/employer" className="hover:text-ink/70">
                    İşveren Paneli
                  </Link>
                )}
                {session?.role === "ADMIN" && (
                  <Link href="/admin" className="hover:text-ink/70">
                    Admin Paneli
                  </Link>
                )}
                {session && (
                  <form action={logout}>
                    <button className="rounded-full border border-ink/20 px-3 py-1 text-xs hover:border-ink/40">
                      Çıkış
                    </button>
                  </form>
                )}
              </nav>
            </div>
          </header>
          <main>{children}</main>
          <footer className="border-t border-ink/10 bg-sand py-10">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 text-sm text-ink/70">
              <p>
                Platform, ilan ve iletişim kolaylığı sağlar. Resmi istihdam süreçleri
                platform tarafından yürütülmez.
              </p>
              <p>
                Kullanıcılar paylaştıkları bilgilerin doğruluğundan sorumludur. Uygunsuz
                içerik ve kullanıcılar admin tarafından kaldırılabilir.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
