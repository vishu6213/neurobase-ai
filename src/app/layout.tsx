import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { ErrorSuppressor } from "@/components/error-suppressor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NeuroBase AI | Autonomous Onchain Intelligence",
  description: "Next-generation AI agents for the Base ecosystem.",
  other: {
    "base:app_id": "69cd297c19afd75ffc3d3b12",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Base Build Verification Meta Tag */}
        <meta name="base:app_id" content="69cd297c19afd75ffc3d3b12" />
        
        {/* Preconnect to Spline's hosted CDN to complete DNS/TCP/SSL handshakes early */}
        <link rel="dns-prefetch" href="https://prod.spline.design" />
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        
        {/* Preconnect to the Cloudfront video distribution network */}
        <link rel="dns-prefetch" href="https://d8j0ntlcm91z4.cloudfront.net" />
        <link rel="preconnect" href="https://d8j0ntlcm91z4.cloudfront.net" crossOrigin="anonymous" />
        
        {/* Preload first slide Spline scene binary immediately to bypass JS waterfall */}
        <link
          rel="preload"
          href="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          as="fetch"
          crossOrigin="anonymous"
        />
        
        {/* Preload overview dashboard background video early to display instantly on login */}
        <link
          rel="preload"
          href="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
          as="video"
          type="video/mp4"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorSuppressor />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
