import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";
import type { AppProps } from "next/app";
import { Header } from "@/components/Header";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
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
