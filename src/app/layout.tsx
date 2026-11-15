import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "../context/AppContext";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { BottomNav } from "../components/layout/BottomNav";

export const metadata: Metadata = {
  title: "S.G.A.S.A. - Student Group Academic & Sports Assistant",
  description: "Web app per il gruppo studenti S.G.A.S.A. - Lezioni, Esami e Calciotto",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body className="bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased selection:bg-orange-500/30 selection:text-orange-300 transition-colors duration-200">
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Desktop Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
              <Header />
              <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
