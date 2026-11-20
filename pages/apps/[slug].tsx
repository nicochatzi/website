import type {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { Chladni } from "@/components/chladni/Chladni";
import { Flock } from "@/components/flock/Flock";
import { Lissa } from "@/components/lissa/Lissa";
import { Moons } from "@/components/moons/Moons";
import { Page } from "@/components/Page";
import { Pond } from "@/components/pond/Pond";
import { Vein } from "@/components/vein/Vein";
import { apps } from "@/data/apps";

const instruments = {
  lissa: Lissa,
  flock: Flock,
  vein: Vein,
  pond: Pond,
  moons: Moons,
  chladni: Chladni,
};

type App = (typeof apps)[number];
const previousNames: Record<string, App["slug"]> = {
  dune: "chladni",
  eclipse: "moons",
  lissajous: "lissa",
  "ripple-tank": "pond",
};

export const getStaticPaths: GetStaticPaths = () => ({
  paths: [...apps.map(({ slug }) => slug), ...Object.keys(previousNames)].map(
    (slug) => ({ params: { slug } }),
  ),
  fallback: false,
});

export const getStaticProps = (({ params }) => {
  const requested = String(params?.slug);
  const slug = previousNames[requested] ?? requested;
  const app = apps.find((app) => app.slug === slug);
  return app
    ? { props: { ...app, moved: requested !== slug } }
    : { notFound: true };
}) satisfies GetStaticProps<App & { moved: boolean }>;

export default function AppPage({
  title,
  slug,
  moved,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  if (moved) {
    const href = `/apps/${slug}`;
    return (
      <>
        <Head>
          <title>{`htz · ${title}`}</title>
          <meta httpEquiv="refresh" content={`0;url=${href}`} />
          <link rel="canonical" href={href} />
        </Head>
        <Link href={href}>Open {title}</Link>
      </>
    );
  }
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
