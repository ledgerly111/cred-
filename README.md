# CRED Global Learning

A seven-page React website with a burgundy, coral and warm-paper visual identity inspired by the supplied design references.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. `npm run build` creates the production site in `dist`; `npm run preview` previews it. Hash routes work on static hosting without server rewrites.

## Included

- Home, About, Services, Programmes, Scholarships, Learning Hub and Contact.
- Supplied video, muted inline autoplay, looping, a play/pause control, and automatic pause when it leaves the viewport. It scrolls away normally. Mobile uses a closer, centred portrait crop.
- Responsive navigation, scroll reveals, staggered cards, interactive accordions, programme category filters, selectable subjects and accessible guide dialogs.
- Reduced-motion support, keyboard navigation, labelled controls and form validation.
- Programme, subject and scholarship enquiries prefill the contact form.
- The supplied SVG is retained unchanged as `public/cred-logo-original.svg`; `public/cred-logo.svg` crops only its outer blank canvas for use in the header. CSS displays it in white on dark backgrounds.

## Image replacement map

The source document contains no embedded images or explicit image-slot count. Thirteen numbered slots were assigned for this layout. Repeated programme cards intentionally reuse the same number.

| Number | Location / suggested subject |
| --- | --- |
| 1 | Home introduction — purposeful learning journey |
| 2 | About — CRED team / people |
| 3 | Services — advisor consultation |
| 4 | Undergraduate degrees |
| 5 | Postgraduate degrees |
| 6 | Doctoral and executive education |
| 7 | Diplomas and progression pathways |
| 8 | Professional qualifications |
| 9 | Short courses and skills development |
| 10 | Scholarships — education access |
| 11 | Learning Hub — education decisions |
| 12 | Learning Hub — career progression |
| 13 | Learning Hub — scholarship guidance |

The shared `Placeholder` component in `src/main.jsx` controls the numbered image areas. Supply the corresponding images to replace each slot. No stock photos or generated images were substituted.

## Content and launch handoff

Content is adapted from `CRED_Global_Learning_Website_Content (1).docx`. Editorial headings are styled for the reference layout. The three Learning Hub quick guides are condensed from the document's existing advisory content; the document did not contain complete blog articles.

Items intentionally awaiting confirmed business information:

- Contact phone, official email, full address and office hours. The supplied city and country are shown.
- A form endpoint or CRM/email integration. The current form validates fields and downloads a plain-text enquiry. It **does not send enquiries**, does not persist personal information in browser storage and does not claim successful delivery. Replace `Contact.submit` with an actual delivery integration before accepting online enquiries.
- Verified impact figures. The document supplied `350+`, `125+`, `50+`, `12+` and `60%` on Home but used `[XX]` elsewhere and explicitly called for verification. Numerical claims have been held out until confirmed.
- Corporate scholarship terms: the document mentions a 25% discount but provides no eligibility or partner details. The site invites confirmation with an advisor instead of advertising an unverified fixed discount.
- Approved Privacy Policy and Terms content, newsletter delivery, and verified social account URLs. No fabricated legal policies, subscription confirmations or dead social links are included.

The source files remain in the project root. The website has not been deployed.

## Glass sidebar design iteration

The current navigation and motion follow the supplied `D:/reference vedio.mp4`: fixed translucent desktop sidebar, adaptive light/dark contrast, full-height video header, reversible word reveals and image reveals. The complete CRED logo appears above every page. Coral page transitions randomly select left, right, up or down without repeating the previous direction. Mobile and tablet layouts use full-width content with a bottom Explore / Menu / Let's talk dock and a full-screen menu. All existing page content and enquiries remain available.

The version from immediately before this iteration is saved locally in `qa/before-glass-sidebar/`. To restore that design, copy its `main.jsx`, `styles.css` and `motion.css` back into `src/`, then rebuild. `glass.css` will no longer be imported. This backup is intentionally excluded from publishing by `.gitignore`.
