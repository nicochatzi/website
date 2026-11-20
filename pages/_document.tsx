import Document, {
  type DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";
import { jetbrains } from "@/lib/fonts";
import { cx } from "@/lib/utils";

export default class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render() {
    return (
      <Html lang="en" className={jetbrains.variable}>
        <Head>
          <meta
            httpEquiv="Content-Security-Policy"
            content="
          default-src 'self';
          base-uri 'none';
          object-src 'none';
          form-action 'none';
          script-src 'self' 'unsafe-inline' https://plausible.io 'unsafe-eval';
          style-src 'self' 'unsafe-inline';
          img-src 'self';
          connect-src 'self' https://plausible.io;
          font-src 'self';
          frame-src 'self' https://www.youtube.com https://youtube.com;
        "
          />
        </Head>
        <body className={cx("bg-gray-50", "dark:bg-gray-925")}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
