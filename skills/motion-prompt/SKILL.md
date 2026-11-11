---
name: motion-prompt
description: Browse yipoo's bilingual Motion Prompt library, receive the user's selected animation IDs, and implement precise motion using published timing, easing and reference code. Use for motion-prompt requests, motion discovery, pasted gallery picks or explicit numbered effects; supports English and Simplified Chinese.
---

# Motion Prompt by yipoo

Repository: https://github.com/yipoo/motion-prompt
Gallery: https://motion.yipoo.com/
Install this bilingual skill from **yipoo/motion-prompt**. Licensing and attribution are recorded in LICENSE and THIRD-PARTY-NOTICES.md.

用户可说“打开动效库”“让我挑选动画”“使用 #020”或粘贴从图库复制的 prompt。跟随用户选择的中文或英文，包括动画画面里的文字。

Run the bundled CLI using the directory containing this file:

```sh
node <skill-dir>/scripts/motion-prompt.mjs search <words> --lang zh-Hans
node <skill-dir>/scripts/motion-prompt.mjs list --pack micro --lang en
node <skill-dir>/scripts/motion-prompt.mjs get 020 --lang zh-Hans
node <skill-dir>/scripts/motion-prompt.mjs kit motion
node <skill-dir>/scripts/motion-prompt.mjs prompt 020 --lang en
```

Use `pick --lang zh-Hans` (or `en`) when the user wants to browse. It prints a gallery URL and waits for the user to pick motions, open the composer and click “交给 AI” / “Send to AI”. `--no-open` prints the URL for a visible browser; `--local` serves from a full clone. Use a retained background execution when the shell has a short timeout. Respect the chosen IDs and their order. If the command times out, no choice was received; do not invent one.

**Hosted access:** #001–#192 stay free. #193–#312 and #319–#324 require an active Pro subscription for the hosted prompt/specification/export service. #313–#318 are also free. Use each catalog entry’s tier/access field for future additions. Everyone can preview animations. Ask the user to sign in at the gallery and subscribe when a Pro selection is blocked; never invent a subscription or bypass a server rejection. Signed-in Pro selections sent through `pick` include the complete prompt and reference implementation in the loopback callback, without passing any sign-in token to the AI. Do not fetch those already included Pro files again. A user-provided short-lived `MOTION_PROMPT_ACCESS_TOKEN` can authorize direct Pro `get`/`prompt`/`kit` reads; never print or persist that token. Existing MIT grants, copyright notices, and public source history are preserved.

For explicit IDs or pasted picks, fetch only those elements with `get` (at most eight per call), then fetch each required `kit` once. The files identify their canvas dimensions and cycle. Read [references/porting.md](references/porting.md) before adapting to CSS, SVG, Canvas, Remotion or other renderers.

The Canvas functions are deterministic `(ctx, width, height, time)`. Preserve timings, easing, paths and loop periods; adapt text, colours and user assets. For web interfaces replace mock cursors and simulated scroll with real events, retaining the specified animation. Respect reduced motion.

**Language and fonts:** Reference code resolves animation copy using `document.documentElement.lang` (`en` or `zh-CN`). Copy `studio/locale.js`, the required kit and the bundled `assets/fonts/NotoSansSC.woff2` into the target, declare `Motion Sans` with `@font-face`, and load it before rendering. Never leave English demo text in a Chinese result (e.g. GO! becomes 出发！), and do not assume the device has Chinese fonts. Port the dictionary alongside code if changing technologies.

**Validation:** Render start, middle, end and the loop boundary. Compare identical timestamps with the library, check actual text in the canvas, test switching languages and a narrow viewport. State what was verified. A successful reference-code replay does not establish that an external video model reproduces exact motion.

**Attribution:** Preserve the original MIT copyright notice for inherited effects and yipoo's credit for new packs. Fonts have their own SIL Open Font License. Do not pass off a newly invented effect as an existing catalog ID.

If the network is unavailable use `MOTION_PROMPT_BASE=/absolute/path/to/api/v1`. `info` shows the selected data source and cache; `--refresh` bypasses stale cache. Unknown IDs are errors, not instructions to invent a replacement. Plain-text APIs are also available at `https://yipoo.github.io/motion-prompt/api/v1/` (`en` and `zh-Hans`).
