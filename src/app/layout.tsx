import type { Metadata } from "next";

import "./globals.css";
import { Providers } from "./providers";
import { BottomNav } from "@/components/layout/bottom-nav";

export const metadata: Metadata = {
  title: "Tortillería Tierra del Campo",
  description: "Sistema POS de la tortillería",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <Providers>
          {/* Alto fijo al viewport: la página no scrollea; el scroll vive dentro del contenido */}
          <div className="flex h-screen flex-col overflow-hidden bg-background">
            <main className="mx-auto w-full max-w-6xl flex-1 overflow-y-auto p-4 pb-24">
              {children}
            </main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
