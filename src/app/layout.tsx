import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/lib/providers/QueryProvider";
import ToastProvider from "@/lib/providers/ToastProvider";
import { baseMetadata } from "@/lib/seo/metadata";
import {
  generateWebsiteStructuredData,
  generateOrganizationStructuredData,
} from "@/lib/seo/structured-data";
import { getBaseUrl } from "@/lib/seo/url";
import Script from "next/script";
import GoogleAnalyticsReporter from "@/components/analytics/GoogleAnalyticsReporter";
import SnowfallOverlay from "@/components/common/SnowfallOverlay";

const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-6H7SKF5RQY";

export const metadata: Metadata = {
  ...baseMetadata,
  verification: {
    google: "7z7bo7XpPzzE0ZoS8fUr8CXE4A8K4q2fGRxK3tTO3I4",
    yandex: "your-yandex-verification-code",
  },
  category: "entertainment",
  classification: "Manga Reading Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = generateWebsiteStructuredData();
  const organizationStructuredData = generateOrganizationStructuredData();

  const baseUrl = getBaseUrl();

  return (
    <html lang="uz" className="dark" style={{ backgroundColor: "#000000" }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#ff9900" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-title" content="TopManga" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="referrer" content="origin-when-cross-origin" />

        <link rel="canonical" href={baseUrl} />
        <link rel="alternate" hrefLang="uz" href={baseUrl} />
        <link rel="alternate" hrefLang="en" href={baseUrl} />
        <link rel="alternate" hrefLang="ru" href={baseUrl} />
        <link rel="alternate" hrefLang="x-default" href={baseUrl} />
        <meta name="google-site-verification" content="7z7bo7XpPzzE0ZoS8fUr8CXE4A8K4q2fGRxK3tTO3I4" />

        <link
          rel="preload"
          href="/fonts/Inter-Variable.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link
          rel="preconnect"
          href={process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"}
          crossOrigin="anonymous"
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
      </head>
      <body
        suppressHydrationWarning={true}
        style={{ backgroundColor: "#000000" }}
        className="min-h-screen"
      >
        {/* Qor parchalari overlay */}
        <SnowfallOverlay />

        {/* 🔹 GA4 scriptlar */}
        {/* 🔹 GA4 scriptlar */} 
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
              });
            `}
          </Script>
        </>
      )}

      {/* 🔹 Google Ads (AW-17769939673) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17769939673"
        strategy="afterInteractive"
        async
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-17769939673');
        `}
      </Script>


        {/* 🔹 Router o‘zgarganda page_view jo'natadigan komponent */}
        <GoogleAnalyticsReporter />

        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
