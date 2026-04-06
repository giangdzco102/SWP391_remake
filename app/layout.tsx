/* eslint-disable @next/next/no-page-custom-font */
import "./globals.css";
import "@/assets/styles/style.scss";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ClientProviders from "./ClientProviders";

// Extract metadata configuration for better maintainability
const SITE_METADATA = {
  title: "Truyện hay",
  description: "Truyện hay - Đọc truyện online",
  url: "",
  thumbnail: "/thumbnail_logo.png",
  googleVerification: "",
};

// Use a separate function to generate metadata for better readability
const generateMetaTags = (metadata: typeof SITE_METADATA) => (
  <>
    <title>{metadata.title}</title>
    <meta name="description" content={metadata.description} />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1,maximum-scale=1 "
    />
    <link rel="icon" href="/src/app/favicon.ico" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Lora:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
      rel="stylesheet"
    />
    {/* Open Graph / Social Media Meta Tags */}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={metadata.url} />
    <meta property="og:title" content={metadata.title} />
    <meta property="og:description" content={metadata.description} />
    <meta property="og:image" content={metadata.thumbnail} />

    {/* Zalo Meta Tags */}
    <meta property="zalo:site_name" content="FDM" />
    <meta property="zalo:description" content={metadata.description} />
    <meta property="zalo:image" content={metadata.thumbnail} />

    {/* Google Search Console Verification */}
    <meta
      name="google-site-verification"
      content={metadata.googleVerification}
    />
  </>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>{generateMetaTags(SITE_METADATA)}</head>
      <body>
        <AntdRegistry>
          <ClientProviders>{children}</ClientProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
