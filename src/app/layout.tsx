import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RAAG | 3D Spatial Audio Void",
  description: "High-fidelity zero-gravity spatial mixing engine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scrollbar-hide">
      <body className="antialiased bg-black text-white/90 overflow-hidden select-none">
        {children}
      </body>
    </html>
  );
}
