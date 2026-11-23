import { constantTimeEqual, getCookie, randomToken, sha256, type NodusEnv } from "./shopify";

export type ThreePLEnv = NodusEnv & { NODUS_OPERATOR_SECRET?: string };
export type ThreePLWorkspaceRow = {
  id: string;
  business_name: string;
  owner_name: string;
  owner_email: string;
  shop_domain: string | null;
  status: string;
  plan_code: string | null;
  trial_activated_at: string | null;
  trial_ends_at: string | null;
  subscription_status: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
};
export type ThreePLAuth = { workspace: ThreePLWorkspaceRow; accessTokenId: string };
export type CsvData = { headers: string[]; rows: string[][] };

export const nowIso = () => new Date().toISOString();
export const id = () => crypto.randomUUID();
export const clean = (value: unknown, max = 300) => typeof value === "string" ? value.trim().slice(0, max) : "";

export function sameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try { return new URL(origin).origin === new URL(request.url).origin; } catch { return false; }
  }
  // Browser Fetch Metadata is the fallback when Origin is omitted.
  return request.headers.get("Sec-Fetch-Site") === "same-origin";
}

async function hmacHex(secret: string, message: string) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return [...new Uint8Array(signature)].map(value => value.toString(16).padStart(2, "0")).join("");
}

export async function operatorSessionCookie(secret: string, maxAge = 8 * 60 * 60) {
  const expires = Math.floor(Date.now() / 1000) + maxAge;
  const signature = await hmacHex(secret, "nodus-operator:" + expires);
  return "__Host-nodus_ops_session=" + expires + "." + signature + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=" + maxAge;
}
export const clearOperatorCookie = "__Host-nodus_ops_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";

export async function operatorAuthorized(request: Request, env: ThreePLEnv) {
  const secret = env.NODUS_OPERATOR_SECRET || "";
  if (secret.length < 32) return false;
  const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  if (bearer && constantTimeEqual(secret, bearer)) return true;
  const raw = getCookie(request, "__Host-nodus_ops_session");
  if (!raw) return false;
  const [expiresText, signature] = raw.split(".");
  const expires = Number(expiresText);
  if (!Number.isSafeInteger(expires) || expires <= Math.floor(Date.now() / 1000) || !signature) return false;
  const expected = await hmacHex(secret, "nodus-operator:" + expires);
  return constantTimeEqual(expected, signature);
}

export function operatorSecretMatches(secret: string, env: ThreePLEnv) {
  const expected = env.NODUS_OPERATOR_SECRET || "";
  return expected.length >= 32 && constantTimeEqual(expected, secret);
}

export async function issueAccessToken(workspaceId: string, label: string, env: ThreePLEnv) {
  const token = randomToken(32);
  const tokenHash = await sha256(token);
  const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
  await env.NODUS_DB.prepare("INSERT INTO threepl_access_tokens(id,workspace_id,token_hash,label,expires_at,created_at) VALUES(?,?,?,?,?,?)")
    .bind(id(), workspaceId, tokenHash, clean(label, 80) || "Merchant access", expiresAt, Math.floor(Date.now() / 1000)).run();
  return { token, expiresAt };
}

export const merchantSessionCookie = (token: string, maxAge = 7 * 24 * 60 * 60) =>
  "__Host-nodus_3pl_session=" + token + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
export const clearMerchantCookie = "__Host-nodus_3pl_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";

export async function getWorkspace(request: Request, env: ThreePLEnv): Promise<ThreePLAuth | null> {
  const token = getCookie(request, "__Host-nodus_3pl_session");
  if (!token || token.length > 256) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const access = await env.NODUS_DB.prepare(
    "SELECT t.id AS token_id,w.* FROM threepl_access_tokens t JOIN threepl_workspaces w ON w.id=t.workspace_id WHERE t.session_hash=? AND t.revoked_at IS NULL AND t.session_expires_at>?"
  ).bind(tokenHash, now).first<ThreePLWorkspaceRow & { token_id: string }>();
  if (!access || ["suspended", "closed"].includes(access.status)) return null;
  await env.NODUS_DB.prepare("UPDATE threepl_access_tokens SET last_used_at=? WHERE id=?").bind(now, access.token_id).run();
  const { token_id, ...workspace } = access;
  return { workspace, accessTokenId: token_id };
}

export function canWrite(workspace: ThreePLWorkspaceRow) {
  const now = Date.now();
  if (workspace.status === "onboarding") return true;
  if (workspace.subscription_status === "active" && (!workspace.subscription_ends_at || Date.parse(workspace.subscription_ends_at) > now)) return true;
  if (workspace.subscription_status === "cancelled" && workspace.subscription_ends_at && Date.parse(workspace.subscription_ends_at) > now) return true;
  return workspace.status === "trial" && Boolean(workspace.trial_ends_at && Date.parse(workspace.trial_ends_at) > now);
}

export async function logWorkspaceEvent(env: ThreePLEnv, workspaceId: string, action: string, detail: unknown = {}, actorType = "operator") {
  await env.NODUS_DB.prepare("INSERT INTO threepl_workspace_events(id,workspace_id,actor_type,action,detail_json,created_at) VALUES(?,?,?,?,?,?)")
    .bind(id(), workspaceId, clean(actorType, 30), action, JSON.stringify(detail), nowIso()).run();
}
export async function logCaseEvent(env: ThreePLEnv, workspaceId: string, exceptionId: string, actorType: string, action: string, detail: unknown = {}) {
  await env.NODUS_DB.prepare("INSERT INTO threepl_case_events(id,workspace_id,exception_id,actor_type,action,detail_json,created_at) VALUES(?,?,?,?,?,?,?)")
    .bind(id(), workspaceId, exceptionId, actorType, action, JSON.stringify(detail), nowIso()).run();
}

export function parseCsv(source: string, maxBytes = 5 * 1024 * 1024, maxRows = 20000): CsvData {
  if (new TextEncoder().encode(source).byteLength > maxBytes) throw new Error("CSV files are limited to 5 MB.");
  const text = source.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  const pushField = () => { row.push(field.trim()); field = ""; closed = false; };
  const pushRow = () => {
    pushField();
    if (row.some(cell => cell !== "")) rows.push(row);
    row = [];
    if (rows.length > maxRows + 1) throw new Error("CSV exceeds the " + maxRows.toLocaleString() + "-row limit.");
  };
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (ch === '"') { quoted = false; closed = true; }
      else field += ch;
    } else if (closed) {
      if (ch === ",") pushField();
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; pushRow(); }
      else if (ch !== " " && ch !== "\t") throw new Error("Unexpected characters after a quoted CSV field.");
    } else if (ch === '"') {
      if (field.trim()) throw new Error("Quote inside an unquoted CSV field.");
      field = ""; quoted = true;
    } else if (ch === ",") pushField();
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; pushRow(); }
    else field += ch;
  }
  if (quoted) throw new Error("CSV contains an unterminated quoted field.");
  pushRow();
  if (rows.length < 2) throw new Error("CSV needs a header and at least one data row.");
  const headers = rows[0]!.map(value => value.toLowerCase().replace(/[ -]+/g, "_"));
  if (headers.some(value => !value) || new Set(headers).size !== headers.length) throw new Error("CSV headers must be non-empty and unique.");
  const data = rows.slice(1);
  for (let i = 0; i < data.length; i++) if (data[i]!.length !== headers.length) throw new Error("CSV row " + (i + 2) + " has an inconsistent number of columns.");
  return { headers, rows: data };
}

export function csvValue(row: string[], headers: string[], key: string, required = true) {
  const index = headers.indexOf(key);
  if (index < 0) { if (required) throw new Error("Missing required CSV column: " + key); return ""; }
  const value = row[index] ?? "";
  if (required && !value) throw new Error("Missing " + key + " in a CSV row.");
  return value;
}

export function dateOnly(raw: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new Error("Dates must use YYYY-MM-DD.");
  const value = new Date(raw + "T00:00:00.000Z");
  if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== raw) throw new Error("Invalid calendar date: " + raw);
  return raw;
}

export function quantity(raw: string) {
  const value = Number(raw);
  if (raw.length > 24 || !/^\d+(\.\d{1,3})?$/.test(raw) || !Number.isFinite(value) || value <= 0 || value > 1_000_000_000_000) {
    throw new Error("Quantities must be positive, finite decimals with at most three places.");
  }
  return raw;
}

const zeroDecimal = new Set(["BIF","CLP","DJF","GNF","JPY","KMF","KRW","PYG","RWF","UGX","VND","VUV","XAF","XOF","XPF"]);
const threeDecimal = new Set(["BHD","IQD","JOD","KWD","LYD","OMR","TND"]);

export function moneyMinor(raw: string, currencyRaw: string, allowNegative = false) {
  const currency = currencyRaw.toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Use a three-letter ISO currency code.");
  const precision = zeroDecimal.has(currency) ? 0 : threeDecimal.has(currency) ? 3 : 2;
  const negative = allowNegative && raw.startsWith("-");
  const numeric = negative ? raw.slice(1) : raw;
  if (numeric.length > 40) throw new Error("Amount exceeds the supported precision and range.");
  const pattern = precision === 0 ? /^\d+$/ : new RegExp("^\\d+(?:\\.\\d{1," + precision + "})?$");
  if (!pattern.test(numeric)) throw new Error("Amount has invalid precision for " + currency + ".");
  const [whole, fraction = ""] = numeric.split(".");
  const absolute = BigInt(whole!) * (10n ** BigInt(precision)) + BigInt((fraction + "0".repeat(precision)).slice(0, precision) || "0");
  return { minor: negative ? -absolute : absolute, currency };
}

export function moneyDisplay(minorRaw: string, currency: string) {
  const precision = zeroDecimal.has(currency) ? 0 : threeDecimal.has(currency) ? 3 : 2;
  const divisor = 10n ** BigInt(precision);
  const value = BigInt(minorRaw);
  const sign = value < 0n ? "-" : "";
  const absolute = value < 0n ? -value : value;
  const whole = absolute / divisor;
  const fraction = precision ? "." + (absolute % divisor).toString().padStart(precision, "0") : "";
  return sign + whole.toString() + fraction + " " + currency;
}

export { sha256, randomToken };
