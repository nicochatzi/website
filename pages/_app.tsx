import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Header } from "@/components/Header";
import { GoogleAnalytics } from "nextjs-google-analytics";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalytics trackPageViews={{ ignoreHashChange: true }} />
      <ThemeProvider
        defaultTheme="system"
        attribute="class"
      >
        <div className="flex flex-col max-w-3xl mx-auto min-h-full px-4">
          <Header />
          <main id="main">
            <Component {...pageProps} />
          </main>
          <footer className="py-16" />
        </div>
      </ThemeProvider >
    </>
  );
}

export default MyApp;
