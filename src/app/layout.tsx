import "./globals.css";
import { inter } from '@/app/ui/fonts'

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
        {children}
      </body>
    </html>
  );
}
