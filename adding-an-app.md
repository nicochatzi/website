# adding a little app

I'd start with [vein](components/vein/). Zig grows the branches. React draws
them and tells Zig where I put the food. A pulse reaching the end of a branch
is the bit that makes a sound.

Say the next one is called `coral`. Here's how I'd get it running.

1. Copy `wasm/vein.zig` to `wasm/coral.zig` and `components/vein/` to
   `components/coral/`. Rename the component to `Coral` and point the loader
   at `/apps/coral.wasm`. I’d get the copy playing before changing the simulation.
2. In [package.json](package.json), copy `build:vein` and `test:vein`,
   replacing `vein` with `coral` in the names and paths. Add the new Zig file
   to `lint:zig`. Run `pnpm build:coral` with Zig 0.17.1. Run it again after
   a Zig edit so the browser picks up the new binary.
3. Add an entry to [data/apps.ts](data/apps.ts) with the slug, title, a line
   about what you can do, and a `publishedAt` date in UTC. The trees and RSS
   feed pick it up from there. Keep that date when the app changes. Import
   `Coral` in `pages/apps/[slug].tsx` and add `coral: Coral` to `instruments`.
4. For sound, add `coral` to `trimDb` in [instrumentOutput.ts](lib/instrumentOutput.ts).
   Use `new InstrumentOutput("coral")` in the voice and connect it the way
   [vein does](components/vein/voice.ts). That gives it the same reverb,
   compressor and limiter. I’d play it next to flock to set the trim.

Run `pnpm dev` and open `/apps/coral`. Once it feels good, add the test and
build commands and the slug to the [CI build](.github/actions/build-site/action.yml).
Run `pnpm test:coral`, `pnpm lint:zig`, `pnpm lint` and `pnpm build`.
Commit `public/apps/coral.wasm` and the updated `public/rss.xml` with the source.
