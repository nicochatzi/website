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
