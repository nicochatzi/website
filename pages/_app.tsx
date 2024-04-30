import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Header } from "@/components/Header";
import localFont from 'next/font/local';
import PlausibleProvider from "next-plausible";

const jetbrains = localFont({
  src: [
    {
      path: '../public/fonts/JetBrainsMono/JetBrainsMono-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/JetBrainsMono/JetBrainsMono-Italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/JetBrainsMono/JetBrainsMono-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/JetBrainsMono/JetBrainsMono-BoldItalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-jetbrains'
});

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <PlausibleProvider domain="htz.dev">
        <ThemeProvider
          defaultTheme="system"
          attribute="class"
        >
          <div className={`${jetbrains.variable} font-sans flex flex-col max-w-3xl mx-auto min-h-full px-4`}>
            <Header />
            <main id="main">
              <Component {...pageProps} />
            </main>
            <footer className="py-16" />
          </div>
        </ThemeProvider >
      </PlausibleProvider>
    </>
  );
}
