# Component setup

This existing React/Vite site now supports TypeScript, Tailwind CSS v4 and the shadcn component directory convention. Existing JavaScript pages continue to work.

- UI components: `src/components/ui/` (imported as `@/components/ui`).
- Shared utilities: `src/lib/utils.ts` (`cn` uses clsx and tailwind-merge).
- Tailwind entry: `src/tailwind.css`.
- Existing page styles: `src/styles.css` and the CSS files imported by `src/main.jsx`.
- Article and location styling: `src/blog-location.css`.
- Aliases: `vite.config.js`, `tsconfig.json` and `components.json` consistently map `@/` to `src/`.

The requested `/components/ui` folder lives under `src`, the site's source root. Keeping reusable UI here gives shadcn CLI a predictable installation path and lets its generated imports resolve correctly. No additional setup is needed: dependencies are in `package.json`. Run `npm install`, `npm run typecheck` and `npm run dev` after cloning. Future shadcn components can be added using `npx shadcn@latest add <component>`; review generated styles before applying them to this established design.

Tailwind's theme and utilities are imported without Preflight to avoid resetting the existing website's typography, buttons and layout. The project's burgundy, coral and paper colours are mapped into the Tailwind theme.

# Globe and location

`src/components/ui/globe.tsx` adapts the supplied COBE component to the installed library's `update` API. Mutable refs avoid stale drag state; pointer capture, keyboard rotation, ResizeObserver, reduced-motion support and cleanup cover mobile and route changes. The globe has no location dots or visible controls, as requested. Drag and keyboard rotation remain available.

`src/ContactLocation.tsx` pairs the branded globe with an interactive satellite Google Maps iframe and the supplied Google Maps destination link. Google Maps requires internet access and may be blocked by a visitor's privacy settings; the direct location link remains available. There is no secret API key in the frontend. The globe falls back to a styled coordinate illustration if WebGL is unavailable.

# Blog source

`src/blog-content.js` contains all eight articles from `CRED_Website_Blog_Launch_Pack.docx`, including exact titles, introductions, subheadings, paragraphs, bullet lists, next-step copy and source links. Editorial/publishing notes at the beginning of the document are not displayed as an article. No author or publication date has been invented. Cards on Home and Blogs use the document's introductions. Full articles use `#/blog?article=11` through `#/blog?article=18`.

Numbered image slots 10–17 are reserved for the eight articles in document order. Non-blog image slots are 1–9 after the former About image was replaced by statistics cards. Article IDs and URLs remain unchanged. Supplied article claims are reproduced as editorial content; this integration does not independently re-audit their statistics.

Validation: `npm run typecheck`, `npm run build`, `npm test`, and `node scripts/verify-launch.mjs`. The browser scripts require a running preview and Playwright/Chrome. Set `TEST_URL` to its address when needed.
