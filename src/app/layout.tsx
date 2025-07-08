import "./globals.css";
import Navbar from "./ui/navbar";

import { inter } from '@/app/ui/fonts'
import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode,
}>) {
  return (
    <html lang="en">
      <head>
        <title>Means Payment Portal</title>
      </head>
      <body
        className={`${inter.className} antialiased`}
      >
        <div className="flex flex-col h-screen content-center bg-black">
          <Navbar />
          {children}
        </div>
      </body>
    </html>
  );
}
