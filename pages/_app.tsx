import "@/styles/globals.css";
import type { AppProps } from "next/app";
import PlausibleProvider from "next-plausible";
import { ThemeProvider } from "next-themes";
import { Header } from "@/components/Header";
import { jetbrains } from "@/lib/fonts";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <PlausibleProvider domain="htz.dev">
      <ThemeProvider defaultTheme="system" attribute="class">
        <div
          className={`${jetbrains.variable} font-sans flex flex-col max-w-3xl mx-auto min-h-full px-4`}
        >
          <Header />
          <main id="main">
            <Component {...pageProps} />
          </main>
          <footer className="py-16" />
        </div>
      </ThemeProvider>
    </PlausibleProvider>
  );
}
