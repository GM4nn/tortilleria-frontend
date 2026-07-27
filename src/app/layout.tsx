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
          <div className="min-h-screen bg-background">
            <main className="mx-auto max-w-6xl p-4 pb-24">{children}</main>
          </div>
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
