export const apps = [
  { slug: "lissa", title: "lissa" },
  { slug: "flock", title: "flock" },
  { slug: "pond", title: "pond" },
  { slug: "moons", title: "moons" },
] as const;

export const appLinks = apps.map(({ slug }) => ({
  url: `/apps/${slug}`,
  text: `${slug}.wasm`,
}));
