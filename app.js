import { projects, socials } from './content.js';
import { initVisitorCounter } from './visitor-counter.js';
import { initThinkingNotes } from './thinking-notes.js';
import { initHandwriting } from './handwriting.js';

initVisitorCounter();

const byId = id => document.getElementById(id);
const status = byId('status-message');
const announce = message => { if (status) status.textContent = message; };
const colourPreviews = [];

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(url, className = '', text) {
  const link = element('a', className, text);
  try {
    const destination = new URL(url, location.href);
    if (!['https:', 'http:'].includes(destination.protocol)) throw new Error('Unsupported URL');
    link.href = destination.href;
  } catch {
    link.href = `mailto:${socials.email}`;
  }
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function projectImage(project, featured = false) {
  const preview = element('div', 'project-preview');
  const link = externalLink(project.url, `project-image-link${featured ? ' external-link' : ''}`);
  link.id = `project-image-${colourPreviews.length + 1}`;
  link.setAttribute('aria-label', `Visit ${project.name} (opens in a new tab)`);
  if (project.image) {
    const image = element('img', 'project-image');
    image.src = project.image;
    image.alt = `${project.name} — product screenshot`;
    image.loading = 'lazy';
    image.decoding = 'async';
    if (project.width > 0 && project.height > 0) {
      image.width = project.width;
      image.height = project.height;
    }
    link.append(image);
  } else {
    link.append(element('span', 'project-placeholder', project.name));
  }
  const toggle = element('button', 'image-colour-toggle', 'Show colour');
  toggle.type = 'button';
  toggle.setAttribute('aria-pressed', 'false');
  toggle.setAttribute('aria-label', `Show ${project.name} in colour`);
  toggle.setAttribute('aria-controls', link.id);
  const controls = { link, toggle, name: project.name };
  toggle.addEventListener('click', () => setProjectColour(controls, toggle.getAttribute('aria-pressed') !== 'true'));
  colourPreviews.push(controls);
  preview.append(link, toggle);
  return preview;
}

function setProjectColour({ link, toggle, name }, active) {
  link.classList.toggle('is-colour', active);
  toggle.setAttribute('aria-pressed', String(active));
  toggle.textContent = active ? 'Hide colour' : 'Show colour';
  toggle.setAttribute('aria-label', active ? `Hide colour in the ${name} preview` : `Show ${name} in colour`);
}

function renderProjects() {
  const featuredTarget = byId('featured-project');
  const featured = projects[0];
  if (featuredTarget && featured) {
    const article = element('article', 'featured-project');
    const visual = element('div', 'featured-visual');
    visual.append(projectImage(featured, true));
    const info = element('div', 'featured-info');
    const kicker = element('div', 'project-kicker');
    kicker.append(element('span', '', featured.number), element('span', '', featured.category));
    const title = element('h3', 'project-title');
    const titleLink = externalLink(featured.url, '', featured.name);
    const arrow = element('span', 'external-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    titleLink.append(' ', arrow);
    title.append(titleLink);
    info.append(kicker, title, element('p', 'project-description', featured.description), externalLink(featured.url, 'project-open', 'Explore project ↗'));
    article.append(visual, info);
    featuredTarget.replaceChildren(article);
  }

  const index = byId('project-index');
  if (!index) return;
  const fragment = document.createDocumentFragment();
  for (const project of projects.slice(1)) {
    const article = element('article', 'project-card');
    const copy = element('div', 'project-card-copy');
    const meta = element('div', 'project-card-meta');
    meta.append(element('span', '', project.number), element('span', '', project.category));
    const title = element('h3', 'project-card-title');
    const titleLink = externalLink(project.url, '', project.name);
    const arrow = element('span', 'external-arrow', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    titleLink.append(' ', arrow);
    title.append(titleLink);
    copy.append(meta, title, element('p', 'project-description', project.description), externalLink(project.url, 'project-open', 'Explore project ↗'));
    article.append(projectImage(project), copy);
    fragment.append(article);
  }
  index.replaceChildren(fragment);
}

renderProjects();
initThinkingNotes();
initHandwriting();

// Keep navigation native, including deep links and modified clicks.
const isPlainClick = event => !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
document.querySelector('.skip-link')?.addEventListener('click', event => {
  if (!isPlainClick(event)) return;
  event.preventDefault();
  const main = byId('main');
  main?.focus({ preventScroll: true });
  main?.scrollIntoView({ behavior: 'instant', block: 'start' });
});

for (const link of document.querySelectorAll('a[href^="#"]:not(.skip-link)')) {
  link.addEventListener('click', event => {
    if (!isPlainClick(event) || event.detail !== 0 || link.target === '_blank') return;
    let target;
    try { target = byId(decodeURIComponent(link.hash.slice(1))); } catch { return; }
    const heading = target?.querySelector('h1, h2') || target;
    if (!heading) return;
    requestAnimationFrame(() => {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    });
  });
}

const root = document.documentElement;
const siteHeader = document.querySelector('.site-header');
const navLinks = document.querySelectorAll('[data-nav]');
const sections = ['home', 'work', 'about', 'contact'].map(byId).filter(Boolean);
let headerHeight = -1;
let navFrame = null;
let layoutFrame = null;

function viewport() {
  return {
    height: window.visualViewport?.height || window.innerHeight,
    top: window.visualViewport?.offsetTop || 0,
  };
}

function measureHeader() {
  const height = siteHeader ? Math.ceil(siteHeader.getBoundingClientRect().height) : 0;
  if (height === headerHeight) return;
  headerHeight = height;
  if (siteHeader) root.style.setProperty('--header-height', `${height}px`);
}

function updateCurrentSection() {
  navFrame = null;
  const visible = viewport();
  const remaining = Math.max(0, visible.height - headerHeight - 20);
  const marker = visible.top + Math.min(visible.height - 1, headerHeight + 20 + Math.min(40, remaining * 0.1));
  let current = 'home';
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= marker) current = section.id;
  }
  const scroller = document.scrollingElement || root;
  const atEnd = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
  const contact = byId('contact');
  if (atEnd && contact && contact.getBoundingClientRect().top < visible.top + visible.height) current = 'contact';
  for (const link of navLinks) {
    if (link.dataset.nav === current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

function scheduleNavUpdate() {
  if (navFrame === null) navFrame = requestAnimationFrame(updateCurrentSection);
}

window.addEventListener('scroll', scheduleNavUpdate, { passive: true });
window.addEventListener('hashchange', scheduleNavUpdate);

// Desktop colour is a CSS hover/focus treatment. Touch users get explicit
// buttons, while every project image link keeps its normal destination.
const touchMedia = typeof window.matchMedia === 'function' ? window.matchMedia('(hover: none), (pointer: coarse)') : null;
const portraits = document.querySelectorAll('button.portrait-image');

function setPortraitColour(portrait, active) {
  portrait.classList.toggle('is-colour', active);
  portrait.setAttribute('aria-pressed', String(active));
  portrait.setAttribute('aria-label', active ? 'Show portrait in black and white' : 'Show portrait in colour');
}

for (const portrait of portraits) {
  portrait.addEventListener('click', event => {
    if (!touchMedia?.matches && event.pointerType !== 'touch' && event.detail !== 0) return;
    setPortraitColour(portrait, portrait.getAttribute('aria-pressed') !== 'true');
  });
  portrait.addEventListener('blur', () => {
    if (!touchMedia?.matches) setPortraitColour(portrait, false);
  });
}

function resetColourControls() {
  for (const portrait of portraits) setPortraitColour(portrait, false);
  for (const preview of colourPreviews) setProjectColour(preview, false);
  scheduleLayoutUpdate();
}

function refreshLayout() {
  layoutFrame = null;
  measureHeader();
  scheduleNavUpdate();
}

function scheduleLayoutUpdate() {
  if (layoutFrame === null) layoutFrame = requestAnimationFrame(refreshLayout);
}

window.addEventListener('resize', scheduleLayoutUpdate);
window.addEventListener('orientationchange', scheduleLayoutUpdate);
window.addEventListener('load', scheduleLayoutUpdate);
window.visualViewport?.addEventListener('resize', scheduleLayoutUpdate);
window.visualViewport?.addEventListener('scroll', scheduleLayoutUpdate, { passive: true });
if (typeof touchMedia?.addEventListener === 'function') {
  touchMedia.addEventListener('change', resetColourControls);
} else if (typeof touchMedia?.addListener === 'function') {
  touchMedia.addListener(resetColourControls);
}
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(scheduleLayoutUpdate);
  for (const target of [siteHeader, ...sections, ...portraits].filter(Boolean)) layoutObserver.observe(target);
}
document.fonts?.ready.then(scheduleLayoutUpdate, () => {});
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) scheduleLayoutUpdate();
});
refreshLayout();

const copyEmail = byId('copy-email');
const originalCopyContent = copyEmail ? [...copyEmail.childNodes] : [];
let copyReset;

function resetCopyFeedback() {
  clearTimeout(copyReset);
  if (copyEmail) copyEmail.replaceChildren(...originalCopyContent);
}

copyEmail?.addEventListener('click', async () => {
  const email = socials.email;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(email);
    const checkmark = element('span', '', '✓');
    checkmark.setAttribute('aria-hidden', 'true');
    copyEmail.replaceChildren('Copied! ', checkmark);
    announce('Email address copied to clipboard.');
    clearTimeout(copyReset);
    copyReset = setTimeout(resetCopyFeedback, 2000);
  } catch {
    announce(`Email: ${email}`);
    location.href = `mailto:${email}`;
  }
});

window.addEventListener('pagehide', () => {
  if (navFrame !== null) cancelAnimationFrame(navFrame);
  if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
  navFrame = layoutFrame = null;
  resetCopyFeedback();
});
window.addEventListener('pageshow', scheduleLayoutUpdate);
