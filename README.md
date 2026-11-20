# zoxilsi · portfolio 3.0.1

A personal portfolio for zoxilsi, built around Abhijith’s products, experiments, and portrait from [zoxilsi.cc](https://www.zoxilsi.cc/).

Four separate pages keep the live site’s compact monospaced design. The main identity is zoxilsi. The homepage pairs a short personal introduction with a portrait and three selected project previews. The homepage highlights zoxilsi, with the full name Abhijith T introduced only on About. Work and project descriptions give useful context without long case studies. Work, background, and contact details have their own pages. Blue and black accents sit over a dark charcoal background.

Project descriptions are one useful sentence. Official job titles remain in the work history. The dark layout, blue accents, portrait, project images, and visitor counter are preserved. The alternative light redesign remains on `redesign/benji-inspired`; this update starts from the live `main` version.

The Eduport section draws on the supplied CV: JEE-style mock tests, Adapt AI, exam insights, 3D textbooks, and internal tools and AI automations. The 700K+ figure describes platform downloads. Current work is distinguished from shipped products, and the personal CV file is not included in the website build.

The frontend serves its images and fonts locally. The visitor counter uses a private data file with the local Node server, and shared Redis storage with the Vercel function in production.

## Run locally

Requires Node.js 20 or newer. There are no dependencies to install.

```sh
npm run dev
```

Open **http://localhost:3000**. The local server also serves **`/work`**, **`/about`**, and **`/contact`** directly. Refresh after editing a file. To use another port:

```sh
npm run dev -- --port 3001
```

## Build for your hosting service

```sh
npm run build
```

The build copies **`index.html`**, **`work.html`**, **`about.html`**, and **`contact.html`** into **`dist/`**, alongside the scripts, styles, and assets they use. The four documents can be served by a static host with clean HTML URL support. Other hosts need equivalent clean URL configuration for **`/work`**, **`/about`**, and **`/contact`**. The shared visitor count additionally needs the `/api/visitors` backend; uploading only `dist/` does not include a running counter.

The existing Vercel project uses `vercel.json` to build this dependency-free site and publish `dist/`, overriding the previous Vite configuration. Its `cleanUrls: true` and `trailingSlash: false` settings serve the separate HTML files at clean paths. The local development and preview server provides the same paths and redirects their `.html` and trailing-slash aliases. The previous portfolio is preserved on the repository's `portfolio-v2` branch. Vercel deploys `api/visitors.js` as a server function alongside the static pages; configure its Redis connection as described below.

Preview the production build locally:

```sh
npm run preview
```

Stop the development server first, or pass `-- --port 3001` to use a different port.

## Make it yours

- `index.html` — focused homepage with the introduction, portrait, and social links.
- `work.html` — current role, featured project, and visual project grid.
- `about.html` — short bio, work history, and education.
- `contact.html` — email, address-copy action, and social profiles.
- `content.js` — project descriptions, order, screenshots, URLs, and project numbers.
- `styles.css` — dark charcoal appearance with blue and black accents, layout, responsive breakpoints, and typography. Palette variables are at the top of the file.
- `app.js` — project rendering, project filters, email copy, and local time.
- `visitor-counter.js` — fetches and displays the shared visitor total in the footer.
- `api/visitors.js` — same-origin Vercel endpoint for the persistent shared counter.
- `scripts/visitor-redis-store.mjs` — atomically records and deduplicates visitors in Redis.
- `scripts/visitor-store.mjs` — persists visitor counts in a private JSON file for the local Node server.
- `scripts/build.mjs` — copies the four HTML documents and their public assets into `dist/`.
- `scripts/serve.mjs` — serves clean local page routes and the local visitor backend.
- `assets/` — locally stored images and fonts, including font license notices.

**Home** (`/`), **Work** (`/work`), **About** (`/about`), and **Contact** (`/contact`) are separate HTML documents. The shared header uses normal site links, with no JavaScript router. Each page has one main heading, and its current navigation link uses `aria-current="page"`. The homepage’s Eduport link opens `/work#eduport-work` directly. Eduport work is summarized in one sentence. Personal projects appear in a visual grid, with each entry linking to its live product or source code. Interface colours use the shared palette variables.

Locally served IBM Plex Mono gives the introduction, navigation, and supporting text a compact, consistent rhythm. Type uses relative units so browser text-size preferences are respected. Navigation, project actions, and footer links have 44px touch targets; sticky-header measurements keep section links clear as the layout changes. The page accounts for phone safe areas and reduced-motion preferences.

The introduction and portrait sit alongside each other when space allows and stack on smaller screens. Project previews, background information, and footer details adapt to the available width.

Portrait and project images are shown in their original colour, with no hover or tap effects.

Fonts and images are served locally. The visitor counter sends one request to this site's own backend on each page load. The browser does not load a third-party tracking script or contact Redis directly; production storage requests happen on the server.

## Visitor counter

The footer shows **Total visitors**. By default, the counter counts a browser once, so refreshing and reopening the page in that browser do not keep increasing the unique total. It is an estimate of visitors by browser, rather than an exact count of people across all their devices.

The server sets a first-party, anonymous `HttpOnly` cookie valid for one year. Only a SHA-256 hash of that random identifier is stored, alongside the counts; the counter does not store or forward IP addresses. The cookie covers all four pages, so page navigation does not add another unique visitor. Clearing cookies, using a different browser, or waiting until the cookie expires can count as a new visitor.

### On Vercel

Connect an owned Upstash Redis database to the existing `portfolio-v3` Vercel project, selecting the Free plan if available. The integration should add a complete server-side pair of **`UPSTASH_REDIS_REST_URL`** and **`UPSTASH_REDIS_REST_TOKEN`**, or **`KV_REST_API_URL`** and **`KV_REST_API_TOKEN`**. Use the normal read/write token; the endpoint needs atomic Lua commands. Never expose these values in HTML, browser JavaScript, or Git.

`api/visitors.js` and its Redis helper use Node's built-in APIs and need no package installation. Both unique visitors and total visits are retained, and the selected mode controls which one is displayed. Recording uses a single atomic Redis script, so concurrent serverless instances cannot lose increments or double-count the same identifier. No temporary filesystem or in-memory storage is used in production.

The optional `KEY_PREFIX` defaults to `zoxilsi:portfolio:visitors`. Keep that namespace unchanged across deployments to retain the existing count. The keys are `{zoxilsi:portfolio:visitors}:unique` and `{zoxilsi:portfolio:visitors}:visits`. `.env.example` lists the server-side settings without credentials. Production environment changes require a new deployment to take effect. Until a valid database connection is configured, the API returns an explicit 503 and the footer shows the count as unavailable; it does not invent a number.

### With the included Node server

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

Run the local persistence, Redis REST contract, and API checks with `npm test`. Redis contract tests use injected mock responses; they do not provision a database or substitute for checking the live production connection.

## Asset credits

Portrait and project screenshots were retrieved from the existing zoxilsi portfolio and compressed to WebP. Their content is unchanged. IBM Plex Mono and Reenie Beanie are distributed under the SIL Open Font License; their notices are in `assets/fonts/`.

## Homepage interaction

