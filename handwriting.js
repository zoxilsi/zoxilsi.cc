import { handwritingGlyphs } from './assets/handwriting-glyphs.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const handled = new WeakSet();
const records = new Set();
const byElement = new WeakMap();
let observer;
let motionQuery;
let listenersAttached = false;

function cancelAnimations(record) {
  for (const animation of record.animations) {
    try { animation.cancel(); } catch { /* The written text remains visible. */ }
  }
  record.animations = [];
}

function stopObserving(record) {
  try { observer?.unobserve(record.element); } catch { /* The element may have been removed. */ }
  records.delete(record);
}

function complete(record) {
  if (record.state === 'complete') return;
  record.state = 'complete';
  record.element.dataset.handwritingState = 'complete';
  for (const { path } of record.strokes) {
    path.style.strokeDashoffset = '0';
    path.style.opacity = '1';
  }
  cancelAnimations(record);
  stopObserving(record);
}

function restoreOriginal(record) {
  record.state = 'complete';
  cancelAnimations(record);
  stopObserving(record);
  record.element.replaceChildren(...record.originalNodes);
  record.element.dataset.handwritingState = 'complete';
}

function completeAll() {
  for (const record of [...records]) complete(record);
}

function write(record) {
  if (record.state !== 'queued') return;
  if (document.hidden || motionQuery.matches) {
    complete(record);
    return;
  }

  observer.unobserve(record.element);
  record.state = 'writing';
  record.element.dataset.handwritingState = 'writing';
  const totalLength = record.strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  const duration = Math.min(2200, Math.max(800, [...record.text.trim()].length / 30 * 1600));
  const startTime = document.timeline?.currentTime;
  const completions = [];
  let drawnLength = 0;

  try {
    for (const { path, length } of record.strokes) {
      const animation = path.animate([
        { strokeDashoffset: String(length), opacity: 1 },
        { strokeDashoffset: '0', opacity: 1 },
      ], {
        duration: duration * length / totalLength,
        delay: duration * drawnLength / totalLength,
        easing: 'linear',
        // No backwards fill: pending strokes keep their inline opacity of zero.
        fill: 'forwards',
      });
      record.animations.push(animation);
      // Handle cancellation immediately, even if a later stroke cannot animate.
      completions.push(animation.finished.then(() => true, () => false));
      if (Number.isFinite(startTime)) animation.startTime = startTime;
      drawnLength += length;
    }
    Promise.all(completions).then(results => {
      if (record.state !== 'writing') return;
      if (results.every(Boolean)) complete(record);
      else restoreOriginal(record);
    }).catch(() => {
      if (record.state === 'writing') restoreOriginal(record);
    });
  } catch {
    restoreOriginal(record);
  }
}

function stage(element) {
  const text = element.textContent;
  const tokens = text.match(/\s+|\S+/gu);
  if (!tokens || !text.trim()) return null;

  const original = document.createElement('span');
  original.className = 'sr-only';
  original.textContent = text;
  const visual = document.createElement('span');
  visual.className = 'handwriting-visual';
  visual.setAttribute('aria-hidden', 'true');
  const strokes = [];

  for (const token of tokens) {
    if (/^\s+$/u.test(token)) {
      visual.append(document.createTextNode(token));
      continue;
    }

    const word = document.createElementNS(SVG_NS, 'svg');
    word.classList.add('handwriting-word');
    word.setAttribute('focusable', 'false');
    let advance = 0;
    for (const character of token) {
      if (!Object.prototype.hasOwnProperty.call(handwritingGlyphs, character)) return null;
      const glyph = handwritingGlyphs[character];
      if (!Number.isFinite(glyph.advance) || glyph.advance <= 0 || !Array.isArray(glyph.strokes) || glyph.strokes.length === 0) return null;
      for (const stroke of glyph.strokes) {
        if (typeof stroke !== 'string' || !stroke.trim()) return null;
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', stroke);
        path.setAttribute('transform', `translate(${advance} 0)`);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', 'currentColor');
        path.setAttribute('stroke-width', '1.1');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        word.append(path);
        // Measure only real centerlines, before replacing any readable text.
        const length = path.getTotalLength();
        if (!Number.isFinite(length) || length <= 0) return null;
        path.style.strokeDasharray = `${length} ${length}`;
        path.style.strokeDashoffset = String(length);
        path.style.opacity = '0';
        strokes.push({ path, length });
      }
      advance += glyph.advance;
    }
    word.setAttribute('viewBox', `-2 0 ${advance + 4} 28`);
    word.style.width = `${(advance + 4) / 24}em`;
    word.style.height = `${28 / 24}em`;
    visual.append(word);
  }
  if (strokes.length === 0) return null;
  return { element, text, original, visual, originalNodes: [...element.childNodes], strokes, animations: [], state: 'queued' };
}

function prepare() {
  if (!motionQuery) motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motionQuery.matches || document.hidden) return false;
  if (!observer) {
    observer = new window.IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const record = byElement.get(entry.target);
        if (record) write(record);
      }
    }, { threshold: 0.15 });
  }
  if (!listenersAttached) {
    const motionChanged = () => { if (motionQuery.matches) completeAll(); };
    if (typeof motionQuery.addEventListener === 'function') motionQuery.addEventListener('change', motionChanged);
    else if (typeof motionQuery.addListener === 'function') motionQuery.addListener(motionChanged);
    else return false;
    document.addEventListener('visibilitychange', () => { if (document.hidden) completeAll(); });
    window.addEventListener('pagehide', completeAll);
    listenersAttached = true;
  }
  return true;
}

/** Enhance supported notes once; ordinary text remains the fallback. */
export function initHandwriting() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  if (typeof window.matchMedia !== 'function' || typeof window.IntersectionObserver !== 'function') return;
  if (typeof window.Element?.prototype.animate !== 'function' || typeof window.SVGPathElement?.prototype.getTotalLength !== 'function') return;
  if (!window.Animation?.prototype || !('finished' in window.Animation.prototype)) return;

  try { if (!prepare()) return; } catch { return; }

  for (const element of document.querySelectorAll('span[data-handwriting]')) {
    if (handled.has(element)) continue;
    handled.add(element);
    let record;
    try {
      record = stage(element);
      if (!record) continue;
      element.replaceChildren(record.original, record.visual);
      element.dataset.handwritingState = 'queued';
      byElement.set(element, record);
      records.add(record);
      observer.observe(element);
    } catch {
      if (record) restoreOriginal(record);
    }
  }
}
