import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { PWAProvider } from '@/components/providers/pwa-provider';
import "@/lib/antd-config"; // Ant Design 설정 및 경고 억제
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
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
  icons: {
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon/favicon.ico', sizes: 'any' },
    ],
    apple: '/favicon/apple-touch-icon.png',
    other: [
      { url: '/favicon/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
        style={{ margin: 0, padding: 0, height: '100%' }}
      >
        <QueryProvider>
          <AntdRegistry>
            <ThemeProvider>
              <PWAProvider>
                {children}
              </PWAProvider>
            </ThemeProvider>
          </AntdRegistry>
        </QueryProvider>
      </body>
    </html>
  );
}
