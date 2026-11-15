import type {LoaderFunctionArgs} from "react-router";

export async function loader({request}:LoaderFunctionArgs){
  const configured=process.env.SHOPIFY_APP_URL?.trim();
  let origin:string;
  try{origin=new URL(configured||request.url).origin}catch{origin=new URL(request.url).origin}
  const body=[
    "User-agent: *",
    "Allow: /",
    "Disallow: /app",
    "Disallow: /auth/",
    "Disallow: /api/",
    "Disallow: /webhooks",
    "Disallow: /healthz",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body,{headers:{"Content-Type":"text/plain; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}
