# Contributing

Contribute bilingual English and Simplified Chinese motion patterns. Every entry needs a distinct live effect, meaningful names and descriptions, exact timing/easing specifications and a deterministic Canvas implementation. Preserve the MIT attribution and bundle all required assets.

Use `// @kit`, `// @shared`, `// @element NN`, and `// @end` markers (two leading spaces) to distinguish shared dependencies from individual cells. A pack contains 24 entries; each exposes `(ctx,width,height,time)` and returns the canvas width, height, cycle, cells and any font declarations.

Add translations in metadata, use `Motion Sans`, and resolve demo text from the current document language. Source code, comments, metadata and documentation support English and Simplified Chinese only. New effects should address a missing motion use case rather than repeat the same drawing with another colour.

Run `npm run build` and `npm test` with the local server running. Inspect real desktop and mobile screenshots before proposing a change. Open an issue at https://github.com/yipoo/motion-prompt/issues to report missing effects or problems.
