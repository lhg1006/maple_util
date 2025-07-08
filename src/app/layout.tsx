import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { DataProvider } from '@/components/providers/data-provider';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "메이플스토리 유틸리티",
  description: "메이플스토리 종합 정보 사이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, height: '100%' }}
      >
        <QueryProvider>
          <AntdRegistry>
            <ThemeProvider>
              <DataProvider>
                {children}
              </DataProvider>
            </ThemeProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
