import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Link from "next/link";
import { Flock } from "@/components/flock/Flock";
import { Lissajous } from "@/components/lissajous/Lissajous";
import { Page } from "@/components/Page";
import { apps } from "@/data/apps";

const instruments = { lissajous: Lissajous, flock: Flock };

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
  const Instrument = instruments[slug];
  return (
    <Page title={title}>
      <Instrument />
      <Link
        href="/apps"
        className="mt-6 inline-block text-link hover:text-heading"
      >
        ← all apps
      </Link>
    </Page>
  );
}
