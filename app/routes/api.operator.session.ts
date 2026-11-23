import type { ActionFunctionArgs } from "react-router";
import { clearOperatorSessionCookie, operatorSecretMatches, operatorSessionCookie } from "../services/threepl-auth.server";

export async function action({ request }: ActionFunctionArgs) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return Response.json({ ok: false, error: "Cross-origin request rejected." }, { status: 403 });
  if (request.method === "DELETE") {
    return new Response(null, { status: 204, headers: { "Set-Cookie": clearOperatorSessionCookie(), "Cache-Control": "no-store" } });
  }
  if (request.method !== "POST") return Response.json({ ok: false, error: "Method not allowed." }, { status: 405 });
  let body: { secret?: string };
  try { body = await request.json() as { secret?: string }; } catch { return Response.json({ ok: false, error: "Invalid request." }, { status: 400 }); }
  if (!operatorSecretMatches(String(body.secret ?? ""))) return Response.json({ ok: false, error: "Operator credentials are invalid." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return Response.json({ ok: true }, {
    headers: { "Set-Cookie": operatorSessionCookie(String(body.secret)), "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
