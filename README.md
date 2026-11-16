# zoxilsi · portfolio 3.0.1

A personal portfolio for zoxilsi, built around Abhijith’s products, experiments, and portrait from [zoxilsi.cc](https://www.zoxilsi.cc/).

One continuous page pairs a compact monospaced introduction and a large portrait with professional work at Eduport, a featured personal project, a visual project grid, work history, and contact details. Blue and black accents sit over a dark charcoal background. Portrait and project images start in monochrome and reveal their original colour through interaction.

The writing emphasizes people’s needs, priorities, and useful products. Project descriptions start with what each tool helps someone do; technical skills support that story. Official job titles remain in the work history.

The Eduport section draws on the supplied CV: JEE-style mock tests, Adapt AI, exam insights, 3D textbooks, and internal tools and AI automations. The 700K+ figure describes platform downloads. Current work is distinguished from shipped products, and the personal CV file is not included in the website build.

Built locally. No third-party services are needed. The visible visitor counter uses the included Node server and a persistent data file.

## Run locally

Requires Node.js 20 or newer. There are no dependencies to install.

```sh
npm run dev
```

Open **http://localhost:3000**. Refresh after editing a file. To use another port:

```sh
npm run dev -- --port 3001
```

## Build for your hosting service

```sh
npm run build
```

The page in **`dist/`** works on any static hosting service. Native anchor links such as `/#work`, `/#about`, and `/#contact` scroll to sections on the same page without routing rewrites. The shared visitor count additionally needs the `/api/visitors` backend; uploading only `dist/` does not include a running counter.

The existing Vercel project uses `vercel.json` to build this dependency-free site and publish `dist/`, overriding the previous Vite configuration. The previous portfolio is preserved on the repository's `portfolio-v2` branch. The local Node counter does not run as part of this static Vercel deployment; its unavailable state remains visible until a backend with durable shared storage is connected.

Preview the production build locally:

```sh
npm run preview
```

Stop the development server first, or pass `-- --port 3001` to use a different port.

## Make it yours

- `index.html` — hero, thinking prompts, expandable Eduport stories, featured project, visual project grid, about, work history, and contact links.
- `content.js` — project descriptions, order, screenshots, URLs, and project numbers.
- `styles.css` — dark charcoal appearance with blue and black accents, layout, responsive breakpoints, and typography. Palette variables are at the top of the file.
- `app.js` — project rendering, image colour controls, and email copy.
- `thinking-notes.js` — switches the hero’s People, Focus, and Make prompts with accessible native buttons.
- `handwriting.js` — draws the four blue annotations as pen strokes when they first come into view.
- `visitor-counter.js` — fetches and displays the shared visitor total in the footer.
- `scripts/visitor-store.mjs` — persists the visitor total and anonymous visitor hashes.
- `assets/` — locally stored images and fonts, including font license notices.

**Work**, **About**, and **Contact** are sections of one scrolling page. Eduport contributions use native expandable stories, pairing a product question with the work behind it. Personal projects appear in a visual grid, with each entry linking to its live product or source code. The site uses a charcoal background, light text, and blue and black accents. Interface colours use the shared palette variables.

The hero’s **People**, **Focus**, and **Make** buttons switch between short questions about approaching an idea. The default question remains readable without JavaScript, and the controls appear only after initialization.

Locally served IBM Plex Mono gives the introduction, navigation, and supporting text a compact, consistent rhythm. Type uses relative units so browser text-size preferences are respected. Navigation, project actions, and footer links have 44px touch targets; sticky-header measurements keep section links clear as the layout changes. The page accounts for phone safe areas and reduced-motion preferences.

The introduction and portrait sit alongside each other when space allows and stack on smaller screens. Project previews, background information, and footer details adapt to the available width.

Portrait and project images reveal their original colour on hover or keyboard focus on desktop. On touch screens, tap the portrait itself to reveal or hide its colour. Project previews have a separate **Show colour** button, so their image links still open the project. Scrolling an image into view does not reveal its colour automatically.

Fonts and images are served locally. The visitor counter sends one request to this site's own backend on each page load; it does not contact a third-party analytics service.

Four decorative blue notes use an original, locally stored SVG stroke alphabet in `assets/handwriting-glyphs.js`. Each note writes itself once as it enters the viewport, then stays readable. There is no looping or typing cursor. Reduced-motion preferences, hidden tabs, and page navigation finish or skip the drawing; without JavaScript or the required browser features, the original text remains visible.

## Visitor counter

The footer shows **Total visitors**. By default, the counter counts a browser once, so refreshing and reopening the page in that browser do not keep increasing the unique total. It is an estimate of visitors by browser, rather than an exact count of people across all their devices.

The server sets a first-party, anonymous `HttpOnly` cookie valid for one year. The data file stores only a hash of that random identifier, alongside the counts; the counter does not store IP addresses. Clearing cookies, using a different browser, or waiting until the cookie expires can count as a new visitor.

Both `npm run dev` and `npm run preview` include the backend. Counts survive server restarts in **`.data/visitors.json`**. This private directory is ignored by Git, blocked from HTTP access, and excluded from `dist/`. If the service is unavailable, the page shows `—`, with an explanatory tooltip and screen-reader status.

For deployment, run the included server on a Node host with a persistent disk:

```sh
npm run build
HOST=0.0.0.0 VISITOR_DATA_FILE=/path/to/persistent-disk/visitors.json npm run preview
```

`PORT` is supported for hosts that assign a port. Use one running Node process against that file; multiple replicas or a serverless host require shared database storage behind the same API. Keep the data file on storage that survives redeploys. A static-only host needs a backend route connected to a database; there is no pretend browser-only fallback.

To count every page visit, including refreshes, instead of unique browsers:

```sh
VISITOR_COUNT_MODE=visits npm run dev
```

The label changes to **Total visits**. Switching modes preserves the recorded data. `GET /api/visitors` reads the total; `POST /api/visitors` records the visit. Neither endpoint exposes visitor identifiers or stored hashes.

Run the persistence and concurrency checks with `npm test`.

## Asset credits

Portrait and project screenshots were retrieved from the existing zoxilsi portfolio and compressed to WebP. Their content is unchanged. IBM Plex Mono and Reenie Beanie are distributed under the SIL Open Font License; their notices are in `assets/fonts/`.
