import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { DataProvider } from '@/components/providers/data-provider';
import { PWAProvider } from '@/components/providers/pwa-provider';
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
  description: "메이플스토리의 모든 정보를 한 곳에서 확인하세요. 아이템, NPC, 몬스터, 직업, 스킬 정보 검색 및 즐겨찾기 기능 제공.",
  keywords: ["메이플스토리", "MapleStory", "아이템", "NPC", "몬스터", "직업", "스킬", "검색", "유틸리티"],
  authors: [{ name: "Maple Util Team" }],
  creator: "Maple Util",
  publisher: "Maple Util",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "메이플유틸",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://maple-util.vercel.app",
    title: "메이플스토리 유틸리티",
    description: "메이플스토리의 모든 정보를 한 곳에서 확인하세요",
    siteName: "메이플스토리 유틸리티",
  },
  twitter: {
    card: "summary_large_image",
    title: "메이플스토리 유틸리티",
    description: "메이플스토리의 모든 정보를 한 곳에서 확인하세요",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1890ff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
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
                <PWAProvider>
                  {children}
                </PWAProvider>
              </DataProvider>
            </ThemeProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
