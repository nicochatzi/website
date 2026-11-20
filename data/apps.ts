export const apps = [
  {
    slug: "lissa",
    title: "lissa",
    description:
      "Draw a 3D Lissajous curve and hear the oscillators behind it.",
    publishedAt: "2026-11-20T10:37:30Z",
  },
  {
    slug: "flock",
    title: "flock",
    description:
      "Steer a flock of birds through a sample to shape a granular instrument.",
    publishedAt: "2026-11-20T11:00:59Z",
  },
  {
    slug: "pond",
    title: "pond",
    description:
      "Drop stones and drag wakes across a pond with three tuned pickups.",
    publishedAt: "2026-11-20T11:36:53Z",
  },
  {
    slug: "moons",
    title: "moons",
    description:
      "Shape a Lydian chord with the moving shadows of three orbiting moons.",
    publishedAt: "2026-11-20T12:57:08Z",
  },
] as const;

export const appLinks = apps.map(({ slug }) => ({
  url: `/apps/${slug}`,
  text: `${slug}.wasm`,
}));
