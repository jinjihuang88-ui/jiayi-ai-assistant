import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PageViewTracker } from "@/components/PageViewTracker";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const defaultDescription =
  "加移(Jiayi) - 加拿大移民AI评估与持牌顾问服务平台，提供学签、工签、访客签证、EE移民等专业咨询服务";
const defaultKeywords = [
  "加拿大移民",
  "加拿大留学",
  "学签",
  "工签",
  "访客签证",
  "旅游签证",
  "Express Entry",
  "省提名",
  "移民顾问",
  "持牌移民顾问",
  "RCIC",
  "移民评估",
  "签证申请",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://www.jiayi.co"),
  title: {
    default: "加移jiayi | 加拿大移民 C2C SaaS 管理系统",
    template: "%s | 加移jiayi",
  },
  description: defaultDescription,
  keywords: defaultKeywords,
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "加移jiayi | 加拿大移民 C2C SaaS 管理系统",
    description: defaultDescription,
    url: "/",
    siteName: "加移 Jiayi",
    locale: "zh_CN",
    type: "website",
  },
  alternates: {
    canonical: "https://www.jiayi.co",
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
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
        {/* 优先使用网站 logo 作为标签页图标，?v= 避免浏览器强缓存旧图标 */}
        <link rel="icon" type="image/png" href="/logo.png?v=jiayi" />
        <link rel="shortcut icon" type="image/png" href="/logo.png?v=jiayi" />
        {/* 百度站长验证 */}
        <meta name="baidu-site-verification" content="codeva-5vKXoNIMS2" />
        {/* Coze Chat SDK 样式（必须全局） */}
        <link
          rel="stylesheet"
          href="https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.19/libs/cn/style.css"
        />
        {/* JSON-LD for GEO Optimization (DeepSeek, Yuanbao, etc.) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "加移 Jiayi",
              "url": "https://www.jiayi.co",
              "logo": "https://www.jiayi.co/logo.png",
              "description": "加移(Jiayi) 是专业的加拿大移民AI评估与持牌顾问服务平台，提供学签、工签、EE移民、省提名等一站式咨询服务。",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "CA",
                "telephone": "+1-647-643-4369"
              },
              "sameAs": [
                "https://www.jiayi.co/risk-compass"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-647-643-4369",
                "contactType": "customer service",
                "availableLanguage": ["Chinese", "English"]
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
