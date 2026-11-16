const initialized = new WeakSet();

const notes = {
  people: {
    title: 'Who is this for?',
    copy: 'A real person, a real need. That’s where I like to start.',
  },
  focus: {
    title: 'What matters most?',
    copy: 'Find the problem worth solving, and decide what can wait.',
  },
  make: {
    title: 'What can we try?',
    copy: 'Turn the idea into something people can use, then pay attention to what happens.',
  },
};

export function initThinkingNotes() {
  if (typeof document === 'undefined') return;
  const container = document.querySelector('.thinking-notes');
  if (!container || initialized.has(container)) return;

  const title = container.querySelector('#thinking-title');
  const copy = container.querySelector('#thinking-copy');
  const buttons = [...container.querySelectorAll('button[data-thinking-step]')]
    .filter(button => Object.hasOwn(notes, button.dataset.thinkingStep));
  if (!title || !copy || buttons.length === 0) return;

  let activeButton;
  function select(button) {
    if (button === activeButton) return;
    const note = notes[button.dataset.thinkingStep];
    for (const candidate of buttons) {
      candidate.setAttribute('aria-pressed', String(candidate === button));
    }
    title.textContent = note.title;
    copy.textContent = note.copy;
    activeButton = button;
  }

  for (const button of buttons) {
    button.addEventListener('click', () => select(button));
  }
  select(buttons.find(button => button.dataset.thinkingStep === 'people') || buttons[0]);
  const controls = container.querySelector('[data-thinking-controls]');
  if (controls) controls.hidden = false;
  initialized.add(container);
}
