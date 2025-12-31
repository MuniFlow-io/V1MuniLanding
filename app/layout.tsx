import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muniflow - Bond Deal Workflow Management",
  description: "Streamlining bond deal workflows with modern technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

