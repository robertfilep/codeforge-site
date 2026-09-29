// Login page for the private /dev-preview entry point.
// Styled to match public/maintenance.html. Contains no secrets.

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

export function renderLoginPage(error?: string): string {
  const errorBlock = error
    ? `<p class="error" role="alert">${escapeHtml(error)}</p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="dark" />
    <meta name="theme-color" content="#07070a" />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="referrer" content="no-referrer" />
    <title>CodeForge Studio — Private Access</title>
    <link rel="icon" href="/favicon.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --bg: #07070a;
        --fg: #f4f2ef;
        --muted: #9a968f;
        --faint: #5c5953;
        --line: rgba(255, 255, 255, 0.08);
        --ember: #ff6a2b;
        --ember-soft: #ff9a3c;
        --sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        --mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      *, *::before, *::after { box-sizing: border-box; }
      html, body {
        margin: 0;
        min-height: 100%;
        background: var(--bg);
        color: var(--fg);
        font-family: var(--sans);
        -webkit-font-smoothing: antialiased;
      }
      body {
        display: grid;
        place-items: center;
        min-height: 100vh;
        min-height: 100svh;
        padding: max(1.25rem, env(safe-area-inset-top)) 1.25rem max(1.25rem, env(safe-area-inset-bottom));
        overflow-x: hidden;
      }
      .ambient { position: fixed; inset: 0; pointer-events: none; z-index: 0; }
      .ambient::before {
        content: "";
        position: absolute;
        left: 50%;
        top: 50%;
        width: min(120vw, 900px);
        aspect-ratio: 1.4;
        transform: translate(-50%, -50%);
        background: radial-gradient(closest-side, rgba(255, 106, 43, 0.12), rgba(255, 106, 43, 0.04) 45%, transparent 75%);
        filter: blur(20px);
        animation: breathe 9s ease-in-out infinite;
      }
      .ambient::after {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(to right, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
        background-size: 64px 64px;
        mask-image: radial-gradient(ellipse 55% 50% at 50% 50%, #000 20%, transparent 75%);
        -webkit-mask-image: radial-gradient(ellipse 55% 50% at 50% 50%, #000 20%, transparent 75%);
      }
      @keyframes breathe {
        0%, 100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.05); }
      }
      .card {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 400px;
        padding: 2.25rem 1.75rem 2rem;
        border: 1px solid var(--line);
        border-radius: 18px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.8);
        opacity: 0;
        transform: translateY(12px);
        animation: rise 0.8s cubic-bezier(0.2, 0.7, 0.2, 1) 0.05s forwards;
      }
      @media (min-width: 480px) { .card { padding: 2.75rem 2.5rem 2.25rem; } }
      @keyframes rise { to { opacity: 1; transform: none; } }
      .brand { display: flex; align-items: center; gap: 0.7rem; }
      .brand svg { width: 26px; height: 26px; filter: drop-shadow(0 0 10px rgba(255, 106, 43, 0.45)); }
      .wordmark { font-size: 0.74rem; font-weight: 600; letter-spacing: 0.24em; text-transform: uppercase; }
      .eyebrow {
        margin: 2.25rem 0 0.75rem;
        font-family: var(--mono);
        font-size: 0.68rem;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--ember-soft);
      }
      .eyebrow span { color: var(--faint); }
      h1 { margin: 0; font-size: 1.6rem; font-weight: 600; letter-spacing: -0.03em; }
      .hint { margin: 0.6rem 0 0; font-size: 0.9rem; line-height: 1.6; color: var(--muted); }
      form { margin-top: 1.75rem; }
      label {
        display: block;
        margin-bottom: 0.5rem;
        font-family: var(--mono);
        font-size: 0.66rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--faint);
      }
      input {
        width: 100%;
        padding: 0.85rem 1rem;
        border: 1px solid var(--line);
        border-radius: 10px;
        background: rgba(0, 0, 0, 0.35);
        color: var(--fg);
        font: inherit;
        font-size: 1rem;
        transition: border-color 0.25s ease, box-shadow 0.25s ease;
      }
      input:focus {
        outline: none;
        border-color: rgba(255, 106, 43, 0.55);
        box-shadow: 0 0 0 4px rgba(255, 106, 43, 0.12);
      }
      button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.55rem;
        width: 100%;
        margin-top: 1rem;
        padding: 0.9rem 1rem;
        border: 0;
        border-radius: 10px;
        background: linear-gradient(100deg, var(--ember-soft), var(--ember) 60%, #e8431d);
        color: #140904;
        font: inherit;
        font-size: 0.95rem;
        font-weight: 600;
        letter-spacing: -0.005em;
        cursor: pointer;
        box-shadow: 0 10px 30px -12px rgba(255, 106, 43, 0.7);
        transition: transform 0.2s ease, box-shadow 0.3s ease, filter 0.3s ease;
      }
      button svg { width: 15px; height: 15px; transition: transform 0.3s ease; }
      button:hover { filter: brightness(1.06); box-shadow: 0 14px 36px -12px rgba(255, 106, 43, 0.85); }
      button:hover svg { transform: translateX(3px); }
      button:active { transform: translateY(1px); }
      button:focus-visible { outline: 2px solid var(--ember-soft); outline-offset: 3px; }
      .error {
        margin: 1rem 0 0;
        padding: 0.7rem 0.9rem;
        border: 1px solid rgba(255, 90, 60, 0.3);
        border-radius: 10px;
        background: rgba(255, 90, 60, 0.07);
        font-size: 0.85rem;
        color: #ffb4a1;
      }
      .foot {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 1.75rem 0 0;
        padding-top: 1.25rem;
        border-top: 1px solid var(--line);
        font-family: var(--mono);
        font-size: 0.64rem;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: var(--faint);
      }
      .foot svg { width: 12px; height: 12px; }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { animation: none !important; transition: none !important; }
        .card { opacity: 1; transform: none; }
      }
    </style>
  </head>
  <body>
    <div class="ambient" aria-hidden="true"></div>
    <main class="card">
      <div class="brand">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <linearGradient id="cf-outer" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#ff7a32" />
              <stop offset="1" stop-color="#ef4423" />
            </linearGradient>
          </defs>
          <path fill="url(#cf-outer)" d="M14.6 2c1.2 3.6.4 6.4-2.2 9.3C9.6 14.4 7 17.2 7 21.3 7 26.1 11 30 16 30s9-3.9 9-8.7c0-3-1.3-5.2-3-7.3-.8-1-1.4-2.2-1.5-3.6-1.3 1.1-2 2.6-2 4.2-.9-.6-1.3-1.6-1.2-2.8.3-3.4-.4-7.4-2.7-9.8Z" />
          <path fill="#ff9420" d="M15.3 15.5c-1.8 1.7-3.2 3.3-2.6 5.6.3 1.1 1 2 .9 3.1-.6-.5-1.1-1.1-1.4-1.8-.6 1-.8 2.1-.5 3.2.6 2 2.3 3.4 4.3 3.4 2.6 0 4.6-2 4.6-4.5 0-2.6-2-4-3.6-5.6-1.1-1.1-1.9-2.2-1.7-3.4Z" />
        </svg>
        <span class="wordmark">CodeForge Studio</span>
      </div>

      <p class="eyebrow"><span>//</span> Private access</p>
      <h1>Studio preview</h1>
      <p class="hint">Enter the access password to review the website in development.</p>

      <form method="post" action="/dev-preview" autocomplete="off">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required autofocus maxlength="256" />
        ${errorBlock}
        <button type="submit">
          Enter Studio
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </form>

      <p class="foot">
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.3" />
          <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" stroke="currentColor" stroke-width="1.3" />
        </svg>
        Authorized personnel only
      </p>
    </main>
  </body>
</html>`;
}
