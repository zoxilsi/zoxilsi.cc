let initialization;

/** Read the shared server count, incrementing only on the first initialization. */
export async function initVisitorCounter() {
  if (initialization) return initialization;

  const wrapper = document.getElementById('visitor-counter');
  const number = document.getElementById('visitor-count');
  const label = document.getElementById('visitor-count-label');
  const status = document.getElementById('visitor-count-status');
  if (!wrapper || !number) return;

  const formatter = new Intl.NumberFormat('en-US');
  let requestSequence = 0;
  let activeController;

  function showStatus(message) {
    if (!status) return;
    status.textContent = message;
    status.hidden = !message;
  }

  async function refresh(method) {
    const sequence = ++requestSequence;
    activeController?.abort();
    const controller = new AbortController();
    activeController = controller;
    const timeout = setTimeout(() => controller.abort(), 6000);
    wrapper.dataset.state = 'loading';
    showStatus('Loading count…');

    try {
      const configured = document.querySelector('meta[name="visitor-counter-endpoint"]')?.content.trim();
      const endpoint = new URL(configured || '/api/visitors', document.baseURI);
      if (endpoint.origin !== location.origin) throw new Error('Counter endpoint must use the same origin');

      const response = await fetch(endpoint.href, {
        method,
        credentials: 'same-origin',
        cache: 'no-store',
        keepalive: method === 'POST',
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Counter request failed');
      const contentType = response.headers.get('content-type')?.split(';')[0].trim().toLowerCase();
      if (contentType !== 'application/json' && !contentType?.endsWith('+json')) throw new Error('Counter response is not JSON');

      const result = await response.json();
      if (!result || !Number.isSafeInteger(result.count) || result.count < 0 || !['unique', 'visits'].includes(result.mode)) {
        throw new Error('Invalid counter response');
      }
      if (sequence !== requestSequence) return;

      const formatted = formatter.format(result.count);
      const countLabel = result.mode === 'visits' ? 'Total visits' : 'Total visitors';
      number.textContent = formatted;
      number.setAttribute('aria-label', `${formatted} ${countLabel.toLowerCase()}`);
      if (label) label.textContent = countLabel;
      wrapper.title = `${countLabel} since this counter was enabled`;
      wrapper.dataset.state = 'ready';
      wrapper.dataset.mode = result.mode;
      wrapper.dataset.local = String(result.local === true);
      showStatus('');
    } catch {
      if (sequence !== requestSequence) return;
      number.textContent = '—';
      number.setAttribute('aria-label', 'Visitor count unavailable');
      wrapper.title = 'Visitor count is temporarily unavailable';
      wrapper.dataset.state = 'unavailable';
      showStatus('Count unavailable');
    } finally {
      clearTimeout(timeout);
      if (sequence === requestSequence) activeController = undefined;
    }
  }

  window.addEventListener('pageshow', event => {
    if (event.persisted) void refresh('GET');
  });

  initialization = refresh('POST');
  return initialization;
}
