import { projects, socials } from './content.js';
import { initVisitorCounter } from './visitor-counter.js';

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

function projectImage(project) {
  const preview = element('div', 'project-preview');
  const link = externalLink(project.url, 'project-image-link');
  link.id = `project-image-${colourPreviews.length + 1}`;
  link.setAttribute('aria-label', `Visit ${project.name} (opens in a new tab)`);
  if (project.image) {
    const image = element('img', 'project-image');
    image.src = project.image;
    image.alt = `${project.name} product screenshot`;
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

function timelineRow(project) {
  const row = element('article', 'timeline-row');
  row.dataset.group = project.group;
  const meta = element('div', 'timeline-meta');
  meta.append(element('p', 'timeline-date', project.date), element('p', '', project.category));
  const main = element('div', 'timeline-main');
  const copy = element('div', 'timeline-copy');
  const title = element('h3', 'timeline-title');
  const titleLink = externalLink(project.url, '', project.name);
  const arrow = element('span', 'external-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  titleLink.append(' ', arrow);
  title.append(titleLink);
  copy.append(title, element('p', 'timeline-tagline', project.tagline), element('p', 'timeline-description', project.description));
  const thumb = element('div', 'timeline-thumb');
  thumb.append(projectImage(project));
  main.append(copy, thumb);
  row.append(meta, main);
  return row;
}

function renderWorkTimeline() {
  const timeline = byId('work-timeline');
  const tabs = byId('filter-tabs');
  if (!timeline) return;

  const rows = projects.map(project => ({ project, row: timelineRow(project) }));
  timeline.replaceChildren(...rows.map(entry => entry.row));

  if (!tabs) return;
  const groups = ['All', ...new Set(projects.map(project => project.group))];
  const buttons = groups.map(group => {
    const count = group === 'All' ? projects.length : projects.filter(project => project.group === group).length;
    const button = element('button', 'filter-tab');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(group === 'All'));
    button.dataset.group = group;
    button.append(group, ' ', element('span', '', String(count)));
    button.addEventListener('click', () => {
      for (const other of buttons) other.setAttribute('aria-pressed', String(other === button));
      for (const { project, row } of rows) {
        row.hidden = group !== 'All' && project.group !== button.dataset.group;
      }
      announce(`Showing ${group === 'All' ? 'all projects' : `${group} projects`}.`);
    });
    return button;
  });
  tabs.replaceChildren(...buttons);
}

renderWorkTimeline();

// Keep navigation native, including deep links and modified clicks.
const isPlainClick = event => !event.defaultPrevented && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
document.querySelector('.skip-link')?.addEventListener('click', event => {
  if (!isPlainClick(event)) return;
  event.preventDefault();
  const main = byId('main');
  main?.focus({ preventScroll: true });
  main?.scrollIntoView({ behavior: 'instant', block: 'start' });
});

for (const link of document.querySelectorAll('a[href*="#"]:not(.skip-link)')) {
  link.addEventListener('click', event => {
    if (!isPlainClick(event) || event.detail !== 0 || link.target === '_blank') return;
    let target;
    try {
      const destination = new URL(link.href, location.href);
      if (destination.origin !== location.origin || destination.pathname !== location.pathname || destination.search !== location.search) return;
      target = byId(decodeURIComponent(destination.hash.slice(1)));
    } catch { return; }
    const heading = target?.querySelector('h1, h2, h3') || target;
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
const pages = new Set(['home', 'work', 'about', 'contact', 'colophon']);
let headerHeight = -1;
let layoutFrame = null;

function measureHeader() {
  const height = siteHeader ? Math.ceil(siteHeader.getBoundingClientRect().height) : 0;
  if (height === headerHeight) return;
  headerHeight = height;
  if (siteHeader) root.style.setProperty('--header-height', `${height}px`);
}

function updateCurrentPage() {
  const pathPage = location.pathname.replace(/\/+$/, '').split('/').pop().replace(/\.html$/i, '').toLowerCase();
  const declaredPage = document.body.dataset.page;
  const current = pages.has(declaredPage) ? declaredPage : pages.has(pathPage) ? pathPage : 'home';
  for (const link of navLinks) {
    if (link.dataset.nav === current) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
}

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
  updateCurrentPage();
}

function scheduleLayoutUpdate() {
  if (layoutFrame === null) layoutFrame = requestAnimationFrame(refreshLayout);
}

window.addEventListener('resize', scheduleLayoutUpdate);
window.addEventListener('orientationchange', scheduleLayoutUpdate);
window.addEventListener('load', scheduleLayoutUpdate);
window.visualViewport?.addEventListener('resize', scheduleLayoutUpdate);
if (typeof touchMedia?.addEventListener === 'function') {
  touchMedia.addEventListener('change', resetColourControls);
} else if (typeof touchMedia?.addListener === 'function') {
  touchMedia.addListener(resetColourControls);
}
if ('ResizeObserver' in window && siteHeader) {
  const layoutObserver = new ResizeObserver(scheduleLayoutUpdate);
  layoutObserver.observe(siteHeader);
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
  if (layoutFrame !== null) cancelAnimationFrame(layoutFrame);
  layoutFrame = null;
  resetCopyFeedback();
});
window.addEventListener('pageshow', scheduleLayoutUpdate);

// A small, local experiment: no requests, timers, or motion library.
const happinessRun = byId('happiness-run');
const happinessResult = byId('happiness-result');
const happinessLab = document.querySelector('.happiness-lab');
if (happinessRun && happinessResult && happinessLab) {
  happinessRun.hidden = false;
  happinessRun.addEventListener('click', event => {
    const happy = happinessRun.getAttribute('aria-pressed') !== 'true';
    happinessLab.dataset.instant = String(event.detail === 0);
    happinessLab.classList.toggle('is-happy', happy);
    happinessRun.setAttribute('aria-pressed', String(happy));
    happinessRun.replaceChildren(happy ? 'Reset experiment ' : 'Let’s find out ');
    const arrow = element('span', '', happy ? '↺' : '↗');
    arrow.setAttribute('aria-hidden', 'true');
    happinessRun.append(arrow);
    happinessResult.textContent = happy
      ? 'One small smile. That’s a start.'
      : 'Maybe a small smile is a good place to start.';
  });
}

// Appearance: theme (dark/light/blue) and grain intensity, kept per-device only.
const appearanceToggle = byId('appearance-toggle');
const appearancePanel = byId('appearance-panel');
const themeOptions = document.querySelectorAll('[data-theme-option]');
const grainRange = byId('grain-range');

function readStored(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStored(key, value) {
  try { localStorage.setItem(key, value); } catch { /* storage unavailable */ }
}

function applyTheme(theme, { instant = false } = {}) {
  if (instant) root.dataset.instant = 'true';
  if (theme === 'light' || theme === 'blue') root.setAttribute('data-theme', theme);
  else root.removeAttribute('data-theme');
  for (const option of themeOptions) option.setAttribute('aria-pressed', String(option.dataset.themeOption === theme));
  if (instant) requestAnimationFrame(() => { delete root.dataset.instant; });
}

function applyGrain(value, { instant = false } = {}) {
  if (instant) root.dataset.instant = 'true';
  root.style.setProperty('--grain-opacity', String(Number(value) / 100));
  if (grainRange) grainRange.value = String(value);
  if (instant) requestAnimationFrame(() => { delete root.dataset.instant; });
}

const storedTheme = readStored('zoxilsi-theme') || 'dark';
applyTheme(storedTheme);
const storedGrain = readStored('zoxilsi-grain');
if (storedGrain !== null) applyGrain(storedGrain);

for (const option of themeOptions) {
  option.addEventListener('click', () => {
    const theme = option.dataset.themeOption;
    applyTheme(theme, { instant: true });
    writeStored('zoxilsi-theme', theme);
    announce(`Theme set to ${theme}.`);
  });
}

grainRange?.addEventListener('input', () => {
  applyGrain(grainRange.value, { instant: true });
  writeStored('zoxilsi-grain', grainRange.value);
});

function closeAppearance() {
  if (!appearancePanel || appearancePanel.hidden) return;
  appearancePanel.hidden = true;
  appearanceToggle?.setAttribute('aria-expanded', 'false');
}

appearanceToggle?.addEventListener('click', () => {
  const open = appearancePanel?.hidden;
  if (appearancePanel) appearancePanel.hidden = !open;
  appearanceToggle.setAttribute('aria-expanded', String(open));
});
document.addEventListener('click', event => {
  if (!appearancePanel || appearancePanel.hidden) return;
  if (event.target === appearanceToggle || appearanceToggle?.contains(event.target) || appearancePanel.contains(event.target)) return;
  closeAppearance();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closeAppearance();
});

// Local time, shown next to the home hero's location line.
const localTime = byId('local-time');
if (localTime) {
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const update = () => { localTime.textContent = `${formatter.format(new Date())} IST`; };
  update();
  setInterval(update, 1000);
}
