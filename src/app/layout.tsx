import type { Metadata } from "next";
import { Inter, Lato } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/AuthProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com"),
  title: {
    default: "STDNTLAB - AI-powered student lab for collaborative studying",
    template: "%s | STDNTLAB",
  },
  description: "Join STDNTLAB - an AI-powered student lab platform for smarter, collaborative studying. Connect with study groups, organize sessions, share materials, and ace your exams together.",
  keywords: [
    "student lab",
    "study groups",
    "collaborative learning",
    "AI-powered education",
    "online study platform",
    "group study",
    "study sessions",
    "academic collaboration",
    "student community",
    "learning platform",
  ],
  authors: [{ name: "STDNTLAB" }],
  creator: "STDNTLAB",
  publisher: "STDNTLAB",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com",
    siteName: "STDNTLAB",
    title: "STDNTLAB - AI-powered student lab for collaborative studying",
    description: "Join STDNTLAB - an AI-powered student lab platform for smarter, collaborative studying. Connect with study groups, organize sessions, share materials, and ace your exams together.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "STDNTLAB - AI-powered student lab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STDNTLAB - AI-powered student lab for collaborative studying",
    description: "Join STDNTLAB - an AI-powered student lab platform for smarter, collaborative studying.",
    images: ["/og-image.png"],
    creator: "@stdntlab",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${lato.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
          {children}
          <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
