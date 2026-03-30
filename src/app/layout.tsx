import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPL - Franchise Premier League",
  description:
    "Franchise Premier League - Amateur esports league for competitive players.",
  openGraph: {
    title: "FPL - Franchise Premier League",
    description: "Amateur esports league for competitive players.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
