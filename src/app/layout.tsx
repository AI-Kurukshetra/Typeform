import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Spline_Sans } from "next/font/google";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

const text = Spline_Sans({
  subsets: ["latin"],
  variable: "--font-text"
});

export const metadata: Metadata = {
  title: "Typeform Studio",
  description: "Production-ready Next.js foundation with a clean, minimal layout."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${text.variable} ${display.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
