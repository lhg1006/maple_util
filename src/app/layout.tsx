import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { DataProvider } from '@/components/providers/data-provider';
import { PWAProvider } from '@/components/providers/pwa-provider';
import "@/lib/antd-config"; // Ant Design 설정 및 경고 억제
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
  title: "게임 데이터 뷰어 - 정보 검색 도구",
  description: "게임 데이터 조회 및 검색 도구입니다. 공개 API를 통해 게임 정보를 제공합니다. 모든 게임 데이터의 저작권은 해당 게임사에 있습니다.",
  keywords: ["게임", "데이터", "검색", "뷰어", "정보", "도구"],
  authors: [{ name: "Data Viewer Developer" }],
  creator: "Data Viewer",
  publisher: "Data Viewer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "게임데이터뷰어",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "https://maple-util.vercel.app",
    title: "게임 데이터 뷰어 - 정보 검색 도구",
    description: "게임 데이터 조회 및 검색 도구입니다. 공개 API를 통해 게임 정보를 제공합니다.",
    siteName: "게임 데이터 뷰어",
  },
  twitter: {
    card: "summary_large_image",
    title: "게임 데이터 뷰어 - 정보 검색 도구",
    description: "게임 데이터 조회 및 검색 도구입니다. 공개 API를 통해 게임 정보를 제공합니다.",
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
