/* Techi icon set — 24px grid, 1.5 stroke */
const Ic = ({ d, flip, fill }) =>
  fill ? (
    <svg className="ic" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d }} />
  ) : (
    <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" data-flip={flip ? "" : undefined} dangerouslySetInnerHTML={{ __html: d }} />
  );

const D = {
  plus: '<path d="M12 6v12M6 12h12"/>',
  check: '<path d="M6 12.5l4 4L18 8"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  diag: '<path d="M7 17L17 7M9 7h8v8"/>',
  bag: '<path d="M5.5 8.5h13l-1 10.2a1.5 1.5 0 0 1-1.5 1.3H8a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/>',
  menu: '<path d="M4 9h16M4 15h10"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  target: '<circle cx="12" cy="12" r="7.5"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>',
  house: '<path d="M4 10.5L12 4l8 6.5"/><path d="M6 9v10h12V9"/><path d="M10 19v-5h4v5"/>',
  sleep: '<path d="M15.5 4.5a7 7 0 1 0 4 11.6A6 6 0 0 1 15.5 4.5z"/><path d="M15 9h3l-3 3h3"/>',
  away: '<path d="M13 4H6v16h7"/><path d="M10 12h10M17 9l3 3-3 3"/>',
  arrive: '<path d="M4 10.5L12 4l8 6.5V19H4z"/><path d="M8 14h7M12.5 11.5L15 14l-2.5 2.5"/>',
  screen: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M7 9h4M7 12h6M15.5 9.5v3"/><path d="M9 20h6"/>',
  switch: '<rect x="6" y="3" width="12" height="18" rx="2.5"/><circle cx="12" cy="8" r="1.6"/><circle cx="12" cy="12.5" r="1.6"/><circle cx="12" cy="17" r="1.1"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><rect x="9.5" y="11" width="5" height="4" rx="1"/><path d="M10.5 11V9.8a1.5 1.5 0 0 1 3 0V11"/>',
  voice: '<circle cx="12" cy="12" r="8"/><path d="M10.5 10v4M12.5 8.5v7M14.5 10.5v3"/>',
  stack: '<path d="M12 4l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4M4 16l8 4 8-4"/>',
  install: '<path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6l-8.4 8.4a2 2 0 0 1-2.8-2.8z"/><path d="M14.5 6.5L17 4l3 3-2.5 2.5"/>',
  pin: '<path d="M12 21s6-5.5 6-11a6 6 0 0 0-12 0c0 5.5 6 11 6 11z"/><circle cx="12" cy="10" r="2"/>',
  app: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.5h3"/><path d="M10 9l2-2 2 2M12 7v6"/>',
  bolt: '<path d="M13 3L5 13h6l-1 8 8-10h-6z"/>',
  wa: '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/>',
};

export const Icon = ({ name }) => <Ic d={D[name]} flip={name === "arrow" || name === "diag"} fill={name === "wa"} />;
export const CAT_ICON = { screens: "screen", switches: "switch", security: "shield", voice: "voice", bundles: "stack" };
