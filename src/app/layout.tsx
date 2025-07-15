import { inter } from '@/app/_client_ui/fonts'

import "./globals.css";

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
        className={`${inter.className} antialiased bg-black text-white`}
      >
        {children}
      </body>
    </html>
  );
}
