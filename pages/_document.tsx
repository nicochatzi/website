import { Html, Head, Main, NextScript } from "next/document";
import Document, { DocumentContext } from "next/document";
import { cx } from "@/lib/utils";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="en">
        <Head />
        <meta http-equiv="Content-Security-Policy" content="
          default-src 'self';
          script-src 'self' 'unsafe-inline' https://plausible.io https://s3.amazonaws.com https://nicochatzi.github.io 'unsafe-eval';
          style-src 'self' 'unsafe-inline' https://s3.amazonaws.com https://nicochatzi.github.io;
          img-src 'self' https://s3.amazonaws.com https://nicochatzi.github.io;
          connect-src 'self' https://plausible.io https://s3.amazonaws.com https://nicochatzi.github.io;
          font-src 'self' https://s3.amazonaws.com https://nicochatzi.github.io;
          frame-src 'self' https://www.youtube.com https://youtube.com;
        "/>
        <body
          className={cx(
            "",
            "bg-gray-50",
            "dark:bg-gray-925"
          )}
        >
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
