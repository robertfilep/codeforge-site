// Developer-only "Log out" button for the private /dev-preview session.
//
// Injected by the dev-preview edge function into HTML pages served to
// verified sessions only, so it never appears on the public website. It sits
// outside the React root, so it stays visible across client-side route
// changes. The form posts to the existing /dev-preview/logout endpoint; it
// contains no session data. Removed together with this folder.

const SNIPPET = `
<div id="cfs-devpreview-logout" class="notranslate" translate="no" data-nosnippet>
  <style>
    #cfs-devpreview-logout {
      position: fixed;
      top: calc(env(safe-area-inset-top, 0px) + 56px);
      right: calc(env(safe-area-inset-right, 0px) + 12px);
      z-index: 2147483000;
      margin: 0;
    }
    @media (min-width: 640px) {
      #cfs-devpreview-logout {
        top: calc(env(safe-area-inset-top, 0px) + 72px);
        right: calc(env(safe-area-inset-right, 0px) + 20px);
      }
    }
    #cfs-devpreview-logout form { margin: 0; padding: 0; }
    #cfs-devpreview-logout button {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      margin: 0;
      padding: 7px 12px 7px 10px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 999px;
      background: rgba(7, 7, 10, 0.78);
      -webkit-backdrop-filter: blur(10px);
      backdrop-filter: blur(10px);
      color: #f4f2ef;
      font: 500 12px/1 "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
      letter-spacing: 0.02em;
      cursor: pointer;
      box-shadow: 0 8px 24px -12px rgba(0, 0, 0, 0.7);
      transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    }
    #cfs-devpreview-logout button:hover {
      border-color: rgba(255, 106, 43, 0.55);
      background: rgba(20, 14, 12, 0.9);
      color: #fff;
    }
    #cfs-devpreview-logout button:focus-visible {
      outline: 2px solid #ff9a3c;
      outline-offset: 2px;
    }
    #cfs-devpreview-logout svg {
      width: 14px;
      height: 14px;
      flex: none;
      color: #ff9a3c;
    }
    @media (max-width: 380px) {
      #cfs-devpreview-logout button { padding: 7px; }
      #cfs-devpreview-logout .cfs-devpreview-label {
        position: absolute; width: 1px; height: 1px; overflow: hidden;
        clip: rect(0 0 0 0); white-space: nowrap;
      }
    }
  </style>
  <form method="post" action="/dev-preview/logout">
    <button type="submit" title="Log out of the developer preview">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span class="cfs-devpreview-label">Log out</span>
    </button>
  </form>
</div>
`;

export function injectLogoutButton(html: string): string {
  const index = html.lastIndexOf("</body>");
  return index === -1 ? html + SNIPPET : html.slice(0, index) + SNIPPET + html.slice(index);
}
