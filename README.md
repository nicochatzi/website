<p align="center">
    <a href="https://github.com/nicochatzi/website/actions/workflows/deploy.yml"><img src="https://github.com/nicochatzi/website/actions/workflows/deploy.yml/badge.svg?branch=main" /></a>
</p>


## Local development

Use the Node.js version in `.nvmrc`. With fnm installed, run:

```sh
fnm install
fnm use
npm install --global pnpm@12.22.0
pnpm install --frozen-lockfile
pnpm dev
```

Run `pnpm lint` and `pnpm build` to check the site and export it to `out/`.
Run `pnpm start` to preview the export at `http://127.0.0.1:3000`.
Use `pnpm audit` and `pnpm audit signatures` to repeat the CI security checks.

After editing `wasm/lissa.zig`, run `pnpm build:lissa` with Zig 0.17.1
to refresh the module in `public/apps/`. The site build uses that compiled module.

Rebuild `wasm/flock.zig` with `pnpm build:flock`. The flock uses
[Reynolds’ Boids](https://www.red3d.com/cwr/boids/) and plays overlapping grains
from the recordings in `public/apps/flock-samples/`. Each recording has a matching
waveform image. Run `pnpm waveform:flock` with FFmpeg to regenerate the images
after replacing audio. The selector labels and CC0 recording credits live in
`components/flock/samples.ts`. Run `pnpm lint:zig` to check the Zig sources.

Rebuild pond with `pnpm build:pond`. Its reflecting wave grid
drives three modal percussion voices. Each crest excites a bank of separately
tuned, decaying modes, following the impact model in
[FoleyAutomatic](https://www.cs.ubc.ca/labs/lci/papers/docs2001/van-foleyautomatic.pdf).
The softer attack and changing overtone balance are inspired by
[measurements of the Hang](https://acoustics.org/pressroom/httpdocs/155th/wessel.htm).


In pond’s alive mode the swimmer supplies the wake. Every five to eight seconds,
the Zig engine picks a nearby voicing across roots and inversions. Two pickups
keep their exact pitches as the third moves. Recent voicings are less likely to
recur. Run `pnpm test:harmony` to check walks from every starting chord.
