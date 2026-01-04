import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuniFlow - Municipal Bond Deal System",
  description: "A structured workspace for municipal bond transactions—built around how deals actually move.",
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

