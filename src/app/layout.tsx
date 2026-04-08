import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clippt.xyz"),
  title: "clippt — Clip the good stuff",
  description:
    "A personal AI resource library — clip, tag, and browse links to AI tools, articles, and resources.",
  openGraph: {
    title: "Ben Rowe's clippts",
    description:
      "A personal AI resource library — clip, tag, and browse links to AI tools, articles, and resources.",
    url: "https://clippt.xyz",
    siteName: "clippt",
    type: "website",
  },
};

// Inline script to set dark mode before React hydrates (prevents FOUC)
const themeScript = `
(function() {
  var stored = localStorage.getItem('clippt-theme');
  if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${redHatDisplay.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-bg text-text">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-coral focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
