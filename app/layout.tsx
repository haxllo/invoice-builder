'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/lib/store/StoreProvider";
import { AuthProvider } from "@/lib/context/AuthContext";
import { Sidebar } from "@/components/layout/Sidebar";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900`}
      >
        <AuthProvider>
          <StoreProvider>
            {isLoginPage ? (
              <main>{children}</main>
            ) : (
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 md:pl-64 transition-all duration-300">
                  {children}
                </main>
              </div>
            )}
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}