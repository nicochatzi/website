import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import { Lissajous } from "@/components/lissajous/Lissajous";
import { Page } from "@/components/Page";
import { apps } from "@/data/apps";

export const getStaticPaths: GetStaticPaths = () => ({
  paths: apps.map(({ slug }) => ({ params: { slug } })),
  fallback: false,
});

export const getStaticProps = (({ params }) => {
  const app = apps.find(({ slug }) => slug === params?.slug);
  return app ? { props: app } : { notFound: true };
}) satisfies GetStaticProps<(typeof apps)[number]>;

export default function AppPage({
  title,
  slug,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Page title={title}>
      {slug === "lissajous" ? (
        <Lissajous />
      ) : (
        <div className="grid min-h-48 place-items-center rounded border border-dashed border-muted/50 px-4 text-center text-muted">
          WebAssembly app placeholder
        </div>
      )}
      <Link
        href="/apps"
        className="mt-6 inline-block text-link hover:text-heading"
      >
        ← all apps
      </Link>
    </Page>
  );
}
