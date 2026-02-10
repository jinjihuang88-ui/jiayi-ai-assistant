import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  metadataBase: new URL("https://www.jiayi.co"),
  title: {
    default: "加移AI助理 | 加拿大移民 C2C SaaS 管理系统",
    template: "%s | 加移 Jiayi",
  },
  description:
    "加移（Jiayi）是面向中国用户和加拿大持牌移民顾问的 C2C SaaS 管理系统，提供移民评估、顾问匹配和案件管理等功能。",
  keywords: [
    "加移",
    "Jiayi",
    "加拿大移民",
    "加拿大留学",
    "RCIC",
    "移民顾问",
    "SaaS 管理系统",
    "C2C 平台",
  ],
  openGraph: {
    title: "加移AI助理 | 加拿大移民 C2C SaaS 管理系统",
    description:
      "加移（Jiayi）连接中国用户与加拿大持牌移民顾问，提供评估、沟通与案件管理的一体化平台。",
    url: "/",
    siteName: "加移 Jiayi",
    locale: "zh_CN",
    type: "website",
  },
  alternates: {
    canonical: "https://www.jiayi.co",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* ✅ Coze Chat SDK 样式（必须全局） */}
        <link
          rel="stylesheet"
          href="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/style.css"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
