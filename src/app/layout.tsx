import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google"; // Using Inter as a default, or local fonts if preferred
import { siteConfig } from "@/siteConfig";
import { absoluteUrl, getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const siteUrl = getSiteUrl();
const metadataBase = new URL(siteUrl);
const openGraphImages = siteConfig.seo.ogImages.map((image) => ({
  ...image,
  url: absoluteUrl(image.url),
}));

export const metadata: Metadata = {
  metadataBase,
  applicationName: "Renderless",
  title: {
    default: siteConfig.seo.title,
    template: "%s | Renderless",
  },
  description: siteConfig.seo.description,
  keywords: siteConfig.seo.keywords,
  authors: [{ name: "Renderless", url: siteUrl }],
  creator: "Renderless",
  publisher: "Renderless",
  category: "Performance creative agency",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Renderless",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: openGraphImages,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    images: openGraphImages.slice(0, 1),
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  other: {
    "portfolio:creative_types": "AI-generated ads, performance creative, Meta campaigns, TikTok campaigns, fragrance campaign assets",
    "portfolio:primary_vertical": "D2C fragrance and consumer brands",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#242424",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Renderless",
      url: siteUrl,
      logo: absoluteUrl("/icon-512.png"),
      email: "hello@renderless.agency",
      description: siteConfig.seo.description,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      name: "Renderless",
      url: siteUrl,
      publisher: { "@id": `${siteUrl}/#organization` },
      description: siteConfig.seo.description,
    },
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#service`,
      name: "Renderless performance creative agency",
      url: siteUrl,
      provider: { "@id": `${siteUrl}/#organization` },
      areaServed: "Worldwide",
      serviceType: [
        "AI-generated ads",
        "AI product photography",
        "AI product shoots",
        "Meta campaign management",
        "TikTok campaign management",
        "Performance creative",
        "Creator research",
        "Market listening",
        "Campaign reporting",
      ],
      audience: {
        "@type": "Audience",
        audienceType: "D2C fragrance and consumer brands",
      },
      description: siteConfig.seo.description,
    },
    {
      "@type": "ImageGallery",
      "@id": `${siteUrl}/#portfolio`,
      name: "Renderless AI-generated ads and campaign creative",
      url: siteUrl,
      about: "AI-generated ads, performance creative, fragrance campaign assets, and paid social campaign visuals.",
      associatedMedia: siteConfig.images.slice(0, 12).map((image) => ({
        "@type": "ImageObject",
        contentUrl: absoluteUrl(image.url),
        caption: image.alt,
        description: image.alt,
        creator: { "@id": `${siteUrl}/#organization` },
      })),
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
