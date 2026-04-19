import type { Metadata } from "next";
import { Bricolage_Grotesque, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const body = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono-stack",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://unspoiled.app"),
  title: "Unspoiled — Food-Waste Routing & Compliance Intelligence",
  description:
    "Food-waste routing and compliance intelligence: generator scoring, ban thresholds, processor routing, and evidence-backed analytics for haulers, regulators, and ESG teams.",
  openGraph: {
    title: "Unspoiled — Food-Waste Routing & Compliance Intelligence",
    description:
      "Generator-level compliance scoring, processor routing, and policy evidence for haulers, regulators, and ESG teams.",
    images: ["/opengraph-image"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Unspoiled — Food-Waste Routing & Compliance Intelligence",
    description:
      "Generator-level compliance scoring, processor routing, and policy evidence.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
