# CRED Global Learning

A seven-page React website with a burgundy, coral and warm-paper visual identity inspired by the supplied design references.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production site in `dist`; `npm run preview` previews it. Hash routes work on static hosting without server rewrites.

## Included

- Home, About, Services, Programmes, Scholarships, Blogs and Contact.
- Supplied video, muted inline autoplay, looping, continuous playback without visible video controls. It scrolls away normally. Mobile uses a closer, centred portrait crop.
- Responsive navigation, scroll reveals, staggered cards, interactive accordions, programme category filters, selectable subjects and linked article pages.
- Reduced-motion support, keyboard navigation, labelled controls and form validation.
- Programme, subject and scholarship enquiries prefill the contact form.
- The supplied SVG is retained unchanged as `public/cred-logo-original.svg`; `public/cred-logo.svg` crops only its outer blank canvas for use in the header. CSS displays it in white on dark backgrounds.

## Image replacement map

The source document contains no embedded images or explicit image-slot count. Seventeen numbered slots are assigned for this layout, including eight blog article images. Repeated programme cards intentionally reuse the same number.

| Number | Location / suggested subject |
| --- | --- |
| 1 | Home introduction — purposeful learning journey |
| 2 | Services — advisor consultation |
| 3 | Undergraduate Degrees |
| 4 | Postgraduate Degrees |
| 5 | Doctoral & Executive Education |
| 6 | Diplomas & Progression Pathways |
| 7 | Professional Qualifications |
| 8 | Short Courses & Skills Development |
| 9 | Scholarships — education access |
| 10–17 | Eight blog articles in launch-pack order |

The shared `Placeholder` component in `src/main.jsx` controls the numbered image areas. Supply the corresponding images to replace each slot. No stock photos or generated images were substituted.

## Content and launch handoff

Content is adapted from `CRED_Global_Learning_Website_Content (1).docx`. Editorial headings are styled for the reference layout. The eight blog articles are supplied in `CRED_Website_Blog_Launch_Pack.docx` and preserved in `src/blog-content.js`.

Items intentionally awaiting confirmed business information:

- Official email, full address and office hours. The supplied city and country are shown. The client-provided telephone and WhatsApp number is +94 77 059 7811.
- Optional CRM/email integration. The consultation form validates fields and opens WhatsApp with the enquiry prefilled for +94 77 059 7811. The student reviews the message and presses Send; the website does not claim delivery or store personal information. A fallback link lets the student reopen WhatsApp.
- Corporate scholarship terms: the document mentions a 25% discount but provides no eligibility or partner details. The site invites confirmation with an advisor instead of advertising an unverified fixed discount.
- Approved Privacy Policy and Terms content, newsletter delivery, and verified social account URLs. No fabricated legal policies, subscription confirmations or dead social links are included.

The source files remain in the project root. The website has not been deployed.

## Glass sidebar design iteration

The current navigation and motion follow the supplied `D:/reference vedio.mp4`: a transparent desktop top navigation with adaptive light/dark logo contrast, a video header, reversible word reveals and image reveals. The complete CRED logo appears above every page. Coral page transitions randomly select left, right, up or down without repeating the previous direction. Mobile and tablet layouts use full-width content with a bottom Explore / Menu / Let's talk dock and a full-screen menu. All existing page content and enquiries remain available.

The version from immediately before this iteration is saved locally in `qa/before-glass-sidebar/`. To restore that design, copy its `main.jsx`, `styles.css` and `motion.css` back into `src/`, then rebuild. `glass.css` will no longer be imported. This backup is intentionally excluded from publishing by `.gitignore`.

## September 2026 client corrections

The seven correction documents have been applied to page structure, calls to action, readable text sizes, Mission/Vision, programme filters and the shared footer while retaining the existing colour palette and mobile navigation. The WhatsApp helper appears on every page, hides during scrolling and reappears after 750 ms of idle time. It stays above the mobile dock and hides while the menu is open.

The five client-supplied impact figures are displayed in animated cards at the client-requested positions on Home and About. The supplied Blog Launch Pack is now integrated: all eight cards link to the complete articles. Image placeholders remain numbered.

Run `npm test` with the local preview running. Set `TEST_URL` if Vite uses a port other than 5173. Browser verification requires Playwright and Chrome; set `PLAYWRIGHT_MODULE` for a nonstandard Playwright installation.

See [COMPONENTS.md](COMPONENTS.md) for the TypeScript/Tailwind/shadcn component setup, branded COBE globe, live location map and blog integration details.

The Home Blueprint illustration and former About image slot are replaced by `src/ImpactCards.tsx`: staggered card entrances, rolling counters and a subtle pointer tilt. Each card replays on viewport re-entry; reduced-motion preferences show the final values immediately. Article IDs stay stable while separate image numbers reflect removal of the former image 2.
