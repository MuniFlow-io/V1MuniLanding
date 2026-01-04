import type { Metadata } from "next";
import "./globals.css";
import { AOSProvider } from "@/components/layout/AOSProvider";

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
      <body className="antialiased">
        <AOSProvider>{children}</AOSProvider>
      </body>
    </html>
  );
}

