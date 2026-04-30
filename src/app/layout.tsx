import type { Metadata } from "next";
import { Red_Hat_Display } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/clippt/app-shell";
import { UserProvider } from "@/components/providers/user-provider";

const redHatDisplay = Red_Hat_Display({
  variable: "--font-red-hat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://clippt.xyz"),
  title: "clippt — Skill library",
  description:
    "A social skill-sharing library — save, tag, and discover AI skills and resources with your network.",
  openGraph: {
    title: "clippt — Skill library",
    description:
      "A social skill-sharing library — save, tag, and discover AI skills and resources with your network.",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await getCurrentUser();

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
        <UserProvider user={currentUser}>
          <AppShell currentUser={currentUser}>
            {children}
          </AppShell>
        </UserProvider>
      </body>
    </html>
  );
}
