import type { Metadata } from "next";
import "./globals.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
