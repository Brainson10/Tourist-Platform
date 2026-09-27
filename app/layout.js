import { Fraunces, Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import { ToastProvider } from "@/components/ui/toast";
import { WeaveDefs } from "@/components/ui/weave";
import { siteConfig } from "@/constants/config";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const serif = Source_Serif_4({ variable: "--font-serif-body", subsets: ["latin"], display: "swap" });
const display = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], display: "swap", axes: ["opsz", "SOFT"] });

export const metadata = {
  title: {
    default: `${siteConfig.name} · Discover Northeast India`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: { siteName: siteConfig.name, locale: siteConfig.locale, type: "website" },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f2e8" },
    { media: "(prefers-color-scheme: dark)", color: "#14110d" },
  ],
};

// Runs before first paint so the chosen theme never flashes. Static string, no user input.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");var d=t==="dark"||(t!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d);}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${serif.variable} ${display.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-canvas font-sans text-ink">
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_SCRIPT}
        </Script>
        <WeaveDefs />
        <a href="#main" className="sr-only z-[200] rounded-lg bg-surface px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
