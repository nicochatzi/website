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

Register each new app in `data/apps.ts` with its title, slug, description, and
`publishedAt` timestamp (ISO 8601 with a timezone). The site build includes it
in `/rss.xml` alongside published posts. Keep the timestamp when editing an app.

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

Rebuild moons with `pnpm build:moons`. A distant, extended light source casts each moon’s shadow onto the floor. Raising a moon narrows the dark core and widens the penumbra. A linear fade across this edge controls both the light strip and its twelve harmonic bands.
Drag a moon to move its orbit. Alt-drag vertically for height or Shift-drag horizontally for orbit width. The sliders also work with touch and keyboard. Drag the background to rotate the view. Run `pnpm test:moons` to check shadow coverage and
the synthesis levels.

The Moons stereo pad voices D Lydian across two and a half octaves. D2 and A2
anchor the bass, F♯3 supplies the major third, and E4 and G♯4 carry the ninth
and raised fourth. Each note has a rounded spectral ramp and a
slightly drifting pulse made from two phase-shifted reads of the same
band-limited table. The light reshapes the tables before per-voice saturation
and a gently moving four-pole low-pass filter. The waveform and filter choices
draw on [Roland’s Jupiter-6 manual](https://synthfool.com/docs/Roland/Roland_Jupiter6/Roland_Jupiter_6_Owners_Manual.pdf).

Every instrument feeds the same stereo room in parallel with its dry signal.
The low-mid decay is set to 1.85 seconds, and the return rolls off below 100 Hz. The Zig module in `wasm/room.zig` runs an eight-line feedback delay
network in an AudioWorklet. The worklet uses fixed buffers and the device
sample rate. Rebuild it with `pnpm build:room` and run its impulse-response
checks with `pnpm test:room`.
