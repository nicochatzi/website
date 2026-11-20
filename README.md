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

After editing `wasm/lissajous.zig`, run `pnpm build:lissajous` with Zig 0.17.1
to refresh the module in `public/apps/`. The site build uses that compiled module.
