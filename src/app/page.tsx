import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { StructuredData } from "@/components/SEO/StructuredData";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Join STDNTLAB - an AI-powered student lab platform for smarter, collaborative studying. Connect with study groups, organize sessions, share materials, and ace your exams together.",
  alternates: {
    canonical: "/",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "STDNTLAB",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com",
  logo: `${process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com"}/logo.png`,
  description: "AI-powered student lab platform for smarter, collaborative studying",
  sameAs: [],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "STDNTLAB",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com",
  description: "AI-powered student lab platform for smarter, collaborative studying",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || "https://stdntlab.com"}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function Home() {
  return (
    <>
      <StructuredData data={organizationSchema} />
      <StructuredData data={websiteSchema} />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <Hero />
          <div id="features">
            <Features />
          </div>
          <div id="how-it-works">
            <HowItWorks />
          </div>
          <div id="testimonials">
            <Testimonials />
          </div>
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  );
}
