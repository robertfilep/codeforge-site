/**
 * Private developer access to the in-progress CodeForge Studio website.
 *
 * While maintenance mode is active, public visitors see
 * public/maintenance.html. This edge function adds a password-protected
 * entry point at /dev-preview: after a successful login it issues a signed,
 * HttpOnly session cookie, and the "DEV PREVIEW" block in public/_redirects
 * routes requests carrying that cookie to the real React app.
 *
 * The cookie's signature is verified here on every request, before any
 * redirect rule runs, so a forged or expired cookie never reaches the app.
 *
 * The password lives only in the PROTECTED_PAGE_PASSWORD environment
 * variable. To remove the feature, delete this folder and the DEV PREVIEW
 * block in public/_redirects.
 */
import type { Config, Context } from "@netlify/edge-functions";
import { renderLoginPage } from "./login-page.ts";

const COOKIE_NAME = "cfs_dev_session";
const SESSION_SECONDS = 60 * 60 * 24;
const LOGIN_PATH = "/dev-preview";
const LOGOUT_PATH = "/dev-preview/logout";
const ROBOTS = "noindex, nofollow";

const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function passwordMatches(input: string, secret: string): Promise<boolean> {
  // Compare fixed-length MACs so timing doesn't leak the password length or content
  const [a, b] = await Promise.all([
    hmac(secret, `password:${input}`),
    hmac(secret, `password:${secret}`),
  ]);
  return constantTimeEqual(a, b);
}

// Session token: "<expiry>.<signature>". Signed with the password, so changing
// PROTECTED_PAGE_PASSWORD immediately invalidates every existing session.
async function createSession(secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  return `${expires}.${await hmac(secret, `session:${expires}`)}`;
}

async function isValidSession(token: string, secret: string): Promise<boolean> {
  const [expiresRaw, signature, extra] = token.split(".");
  if (!expiresRaw || !signature || extra !== undefined || !/^\d+$/.test(expiresRaw)) {
    return false;
  }
  const expires = Number(expiresRaw);
  const now = Math.floor(Date.now() / 1000);
  if (expires <= now || expires > now + SESSION_SECONDS + 60) return false;
  return constantTimeEqual(signature, await hmac(secret, `session:${expires}`));
}

function sessionCookie(value: string, maxAge: number): string {
  return `${COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Strict`;
}

function privateHeaders(extra: Record<string, string> = {}): Headers {
  return new Headers({
    "Cache-Control": "private, no-store",
    "X-Robots-Tag": ROBOTS,
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "no-referrer",
    ...extra,
  });
}

function loginPage(status: number, error?: string, headers: Record<string, string> = {}) {
  return new Response(renderLoginPage(error), {
    status,
    headers: privateHeaders({
      "Content-Type": "text/html; charset=utf-8",
      // Not "no-referrer": under that policy browsers send `Origin: null` with the
      // login form POST, which the cross-site check below would reject.
      // "same-origin" still never leaks the URL to other sites.
      "Referrer-Policy": "same-origin",
      ...headers,
    }),
  });
}

function redirect(location: string, headers: Record<string, string> = {}) {
  return new Response(null, { status: 303, headers: privateHeaders({ Location: location, ...headers }) });
}

async function handleLogin(req: Request, url: URL, secret: string, authenticated: boolean) {
  if (req.method === "GET" || req.method === "HEAD") {
    return authenticated ? redirect("/") : loginPage(200);
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: privateHeaders({ Allow: "GET, POST" }) });
  }

  // Reject cross-site form posts
  const origin = req.headers.get("origin");
  if (origin && origin !== url.origin) {
    return new Response("Forbidden", { status: 403, headers: privateHeaders() });
  }

  if (!secret) {
    return loginPage(503, "Private access is not configured yet.");
  }

  let password = "";
  try {
    const value = (await req.formData()).get("password");
    password = typeof value === "string" ? value : "";
  } catch {
    // Malformed body: treat as an empty password
  }

  if (!password || password.length > 256 || !(await passwordMatches(password, secret))) {
    // Small delay to slow down password guessing
    await new Promise((resolve) => setTimeout(resolve, 800));
    return loginPage(401, "Incorrect password. Please try again.");
  }

  return redirect("/", {
    "Set-Cookie": sessionCookie(await createSession(secret), SESSION_SECONDS),
  });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  const secret = Netlify.env.get("PROTECTED_PAGE_PASSWORD") ?? "";
  const token = context.cookies.get(COOKIE_NAME);
  const authenticated = Boolean(secret && token && (await isValidSession(token, secret)));

  if (path === LOGOUT_PATH) {
    return redirect(LOGIN_PATH, { "Set-Cookie": sessionCookie("", 0) });
  }

  if (path === LOGIN_PATH) {
    return handleLogin(req, url, secret, authenticated);
  }

  if (authenticated) {
    // Continue to the real app (routed by the DEV PREVIEW redirect rules)
    const upstream = await context.next();
    const response = new Response(upstream.body, upstream);
    response.headers.set("X-Robots-Tag", ROBOTS);
    if (response.headers.get("content-type")?.includes("text/html")) {
      response.headers.set("Cache-Control", "private, no-store");
    }
    return response;
  }

  if (token) {
    // A session cookie that is present but invalid or expired must not reach the
    // cookie-based redirect rules. Clear it and serve the public experience instead.
    const clear = { "Set-Cookie": sessionCookie("", 0) };
    if (path.startsWith("/assets/")) {
      return new Response("Not Found", { status: 404, headers: privateHeaders(clear) });
    }
    const maintenance = await fetch(new URL("/maintenance.html", url));
    return new Response(maintenance.body, {
      status: 200,
      headers: privateHeaders({ "Content-Type": "text/html; charset=utf-8", ...clear }),
    });
  }

  // The built React app bundles are only needed by signed-in developers.
  // The maintenance page doesn't use them, so keep unfinished content private.
  if (path.startsWith("/assets/")) {
    return new Response("Not Found", { status: 404, headers: privateHeaders() });
  }

  // Public visitor: continue to the normal routing (maintenance page)
  return;
};

export const config: Config = {
  path: "/*",
};
