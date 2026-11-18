export interface D1Statement {
 bind(...values: unknown[]): D1Statement;
 first<T = unknown>(): Promise<T | null>;
 all<T = unknown>(): Promise<{ results: T[] }>;
 run(): Promise<unknown>;
}
export interface D1Database { prepare(sql: string): D1Statement; batch(statements: D1Statement[]): Promise<unknown[]>; }
export interface NodusEnv {
 NODUS_DB: D1Database;
 SHOPIFY_API_KEY?: string;
 SHOPIFY_API_SECRET?: string;
 TOKEN_ENCRYPTION_KEY?: string;
}
export interface PagesContext { request: Request; env: NodusEnv; }
export const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer"}});
export const cleanShop=(value:string|null)=>{const shop=(value||"").trim().toLowerCase();return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(shop)?shop:null;};
const enc=new TextEncoder();
export async function sha256(value:string){const digest=await crypto.subtle.digest("SHA-256",enc.encode(value));return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");}
export function randomToken(bytes=32){const data=crypto.getRandomValues(new Uint8Array(bytes));return btoa(String.fromCharCode(...data)).replaceAll("+","-").replaceAll("/","_").replaceAll("=","");}
function fromBase64(value:string){return Uint8Array.from(atob(value),c=>c.charCodeAt(0));}
function toBase64(value:ArrayBuffer){return btoa(String.fromCharCode(...new Uint8Array(value)));}
async function hmacHex(secret:string,message:string){const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,enc.encode(message));return [...new Uint8Array(sig)].map(x=>x.toString(16).padStart(2,"0")).join("");}
function constantEqual(a:string,b:string){if(a.length!==b.length)return false;let out=0;for(let i=0;i<a.length;i++)out|=a.charCodeAt(i)^b.charCodeAt(i);return out===0;}
export async function verifyOAuthHmac(url:URL,secret:string){const received=url.searchParams.get("hmac")||"";if(!/^[a-f0-9]{64}$/i.test(received))return false;const pairs=[...url.searchParams.entries()].filter(([k])=>k!=="hmac"&&k!=="signature").sort(([a],[b])=>a.localeCompare(b));const message=pairs.map(([k,v])=>`${k}=${v}`).join("&");return constantEqual((await hmacHex(secret,message)).toLowerCase(),received.toLowerCase());}
export async function verifyWebhookHmac(body:string,received:string,secret:string){if(!received)return false;const key=await crypto.subtle.importKey("raw",enc.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);const sig=await crypto.subtle.sign("HMAC",key,enc.encode(body));return constantEqual(toBase64(sig),received);}
async function encryptionKey(env:NodusEnv){if(!env.TOKEN_ENCRYPTION_KEY||env.TOKEN_ENCRYPTION_KEY.length<32)throw new Error("Token encryption is not configured.");const digest=await crypto.subtle.digest("SHA-256",enc.encode(env.TOKEN_ENCRYPTION_KEY));return crypto.subtle.importKey("raw",digest,{name:"AES-GCM"},false,["encrypt","decrypt"]);}
export async function encryptToken(token:string,env:NodusEnv){const iv=crypto.getRandomValues(new Uint8Array(12));const key=await encryptionKey(env);const cipher=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(token));return {ciphertext:toBase64(cipher),iv:toBase64(iv.buffer)};}
export async function decryptToken(ciphertext:string,iv:string,env:NodusEnv){const key=await encryptionKey(env);const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:fromBase64(iv)},key,fromBase64(ciphertext));return new TextDecoder().decode(plain);}
export function getCookie(request:Request,name:string){const cookie=request.headers.get("Cookie")||"";for(const part of cookie.split(";")){const [key,...rest]=part.trim().split("=");if(key===name)return rest.join("=");}return null;}
export async function merchantSession(request:Request,env:NodusEnv){const raw=getCookie(request,"__Host-nodus_session");if(!raw)return null;const tokenHash=await sha256(raw);const now=Math.floor(Date.now()/1000);const row=await env.NODUS_DB.prepare("SELECT s.shop, i.shop_name FROM shopify_sessions s JOIN shopify_installs i ON i.shop=s.shop WHERE s.token_hash=? AND s.expires_at>? AND i.uninstalled_at IS NULL").bind(tokenHash,now).first<{shop:string;shop_name:string|null}>();return row||null;}
export const sessionCookie=(token:string)=>`__Host-nodus_session=${token}; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800`;
export const clearSessionCookie="__Host-nodus_session=; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=0";
export function configured(env:NodusEnv){return Boolean(env.SHOPIFY_API_KEY?.trim()&&env.SHOPIFY_API_SECRET?.trim()&&env.TOKEN_ENCRYPTION_KEY?.length>=32);}
