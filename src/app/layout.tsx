import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AppProvider } from "./providers/provider";

export const metadata: Metadata = {
  title: "Oncology Bridge — Closing Nigeria's Cancer Drug Gap",
  description:
    'Oncology Bridge is a real-time inventory visibility and verification platform closing Nigeria\'s cancer drug access gap — one verified vial at a time.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 antialiased tracking-[-0.01em] [font-family:var(--font)]">
        <AppProvider>
          {children}
          <Toaster richColors/>
        </AppProvider>
      </body>
    </html>
  );
}
