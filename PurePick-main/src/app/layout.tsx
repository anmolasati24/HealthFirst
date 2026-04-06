import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/footer/Footer";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PurePick",
  description: "Emphasizes selecting pure and safe products"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          <Providers>
            <Navbar />
            {children}
            <Footer />
          </Providers>
        </NextThemesProvider>
      </body>
    </html>
  );
}