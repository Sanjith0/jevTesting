// Selects every school in the Handshake job-posting school picker
// ("Search by name" combobox on the Job details tab).
//
// Usage (browser console):
//   1. Open the job, go to Job details, click Edit on the schools section so
//      the "Search by name" box is visible.
//   2. Open DevTools (Cmd+Opt+J / Ctrl+Shift+J), paste this whole file, Enter.
//   3. To stop early, run:  window.__stopSchoolSelect = true
//   4. When it finishes, review the selection and click Save yourself.
//
// Options can be passed by calling it again, e.g.:
//   selectAllHandshakeSchools({ delayMs: 400, max: 50 })

window.selectAllHandshakeSchools = async function selectAllHandshakeSchools(opts = {}) {
  const {
    delayMs = 250, // pause after each click so the UI can catch up
    max = Infinity, // cap on new selections (use a small number for a test run)
    inputSelector = 'input[placeholder="Search by name"]',
    optionSelector = '[role="option"]',
    // Skip consortia / school lists / suggested groups; only pick schools.
    skip = /consorti|school list|suggested|group/i,
  } = opts;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const visible = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  const label = (el) => el.textContent.trim().replace(/\s+/g, ' ');

  const input = document.querySelector(inputSelector);
  if (!input) {
    console.error(`[schools] No input matching ${inputSelector}. Open the schools editor first.`);
    return;
  }

  function fire(el, types) {
    for (const type of types) {
      const Ctor = type.startsWith('pointer') ? PointerEvent : MouseEvent;
      el.dispatchEvent(new Ctor(type, { bubbles: true, cancelable: true, view: window, button: 0 }));
    }
  }

  async function openDropdown() {
    input.scrollIntoView({ block: 'center' });
    input.focus();
    fire(input, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await sleep(150);
  }

  function candidates(seen) {
    return [...document.querySelectorAll(optionSelector)].filter(
      (el) =>
        visible(el) &&
        el.getAttribute('aria-selected') !== 'true' &&
        el.getAttribute('aria-disabled') !== 'true' &&
        !seen.has(label(el)) &&
        !skip.test(label(el))
    );
  }

  // Scroll the dropdown's scroll container so lazily-loaded/virtualized
  // options render. Returns false when already at the bottom.
  function scrollList() {
    const opt = document.querySelector(optionSelector);
    let box = opt && opt.parentElement;
    while (box && box.scrollHeight <= box.clientHeight + 2) box = box.parentElement;
    if (!box || box === document.body || box === document.documentElement) return false;
    const before = box.scrollTop;
    box.scrollTop = box.scrollHeight;
    box.dispatchEvent(new Event('scroll', { bubbles: true }));
    return box.scrollTop !== before;
  }

  window.__stopSchoolSelect = false;
  const seen = new Set();
  let picked = 0;
  let idle = 0;

  await openDropdown();
  if (!document.querySelector(optionSelector)) {
    console.error(
      `[schools] Dropdown opened but no elements match ${optionSelector}. ` +
        'Right-click a school in the list > Inspect, and pass a matching selector as { optionSelector }.'
    );
    return;
  }

  while (picked < max && !window.__stopSchoolSelect) {
    let [opt] = candidates(seen);
    if (!opt) {
      await openDropdown();
      [opt] = candidates(seen);
    }
    if (!opt) {
      if (scrollList()) {
        await sleep(delayMs * 2);
        continue;
      }
      if (++idle >= 3) break; // nothing left to pick
      await sleep(delayMs * 2);
      continue;
    }
    idle = 0;
    const name = label(opt);
    seen.add(name);
    opt.scrollIntoView({ block: 'nearest' });
    fire(opt, ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']);
    picked++;
    if (picked % 25 === 0) console.log(`[schools] ${picked} selected… (last: ${name})`);
    await sleep(delayMs);
  }

  console.log(
    `[schools] Done: clicked ${picked} schools` +
      (window.__stopSchoolSelect ? ' (stopped by you)' : '') +
      '. Review the selection, then click Save.'
  );
  return [...seen];
};

window.__schoolSelectRun = window.selectAllHandshakeSchools();
