# Motion Prompt Studio

English · [简体中文](README.md)

A bilingual redesign of [Motion Prompt by Shohei Ohtaki](https://github.com/showheyohtaki/motion-prompt), adding 120 original effects to the upstream 192 for **312 effects in 13 packs** under MIT.

## Effect gallery

16 real rendered keyframes covering all 13 packs. [Explore all 312 live effects](https://yipoo.github.io/motion-prompt/).

[![Motion Prompt effect grid](docs/screenshots/effect-grid.png)](https://yipoo.github.io/motion-prompt/)

Install **this** skill:

```sh
npx skills add yipoo/motion-prompt --skill motion-prompt
```

Gallery: https://yipoo.github.io/motion-prompt/

```sh
npm install
npm run build
npm run dev
```

Open the printed local URL, normally `http://127.0.0.1:4173/`. This is a static site: no backend, AI API key or external font service is required.

The gallery, motion specifications and generated prompts support English and Simplified Chinese. Text **inside** animated canvases follows the language too, including GO!, character-by-character animation, UI labels and camera HUDs. Noto Sans SC is bundled under the SIL Open Font License.

Search, filter, save favourites, scrub the timeline, customize animated text, inspect reference code, select several effects, compose complete prompts, export JSON and share selections. Favourites, picks, notes and custom text survive reloads. Responsive desktop/mobile layouts and reduced-motion preferences are supported.

The inherited CLI additionally supports `--lang zh-Hans`:

```sh
node skills/motion-prompt/scripts/motion-prompt.mjs prompt 020 --lang zh-Hans
node skills/motion-prompt/scripts/motion-prompt.mjs pick --local --lang en
```

Prompts copied in the gallery use the current origin. For a GitHub Pages deployment, build the static API with your real site URL:

```sh
SITE_URL=https://your-name.github.io/your-repo/ npm run build
```

Publish the repository as a static directory. Use `npm run build` for this redesign; GitHub Actions packages and deploys the static site.

With the local server running, `npm test` checks all 312 exported implementations in both languages at four timestamps: **2,496 frame comparisons**, plus bundled fonts, translated GO, clipboard, persistence, sharing, custom text, responsive layouts and reduced motion. Tiny anti-aliasing differences are tolerated (at most 2 channel levels and under 0.5% changed channels). Screenshots and the report are saved in `.oil-ui/studio/`.

This verifies reproducibility of the reference implementations and prompt links; it is **not** a benchmark of outputs from external AI models.

Translation sources: `translations/`. UI and shared prompt generator: `studio/`. Bundled font and license: `assets/fonts/`.

Original work © 2026 Shohei Ohtaki · MIT License. Noto Sans SC uses the SIL Open Font License.

The new atmosphere pack (289–312) includes large hero banners, sitewide cursor trails, deep space and mathematical backgrounds. Open an effect for a fullscreen pointer preview; cursor effects can also run across the gallery with a non-blocking transparent overlay.

Contact: [dinglei2025@gmail.com](mailto:dinglei2025@gmail.com). Regenerate the actual preview grid with `npm run preview:readme` while the local server is running.
