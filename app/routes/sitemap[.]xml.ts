import type {LoaderFunctionArgs} from "react-router";

const publicPaths=["/","/product","/demo","/buyer-evaluation","/shipping-cost-reconciliation","/free-shipping-threshold-analysis","/methodology","/pricing","/about","/security","/privacy","/support"];

export async function loader({request}:LoaderFunctionArgs){
  const configured=process.env.SHOPIFY_APP_URL?.trim();
  let origin:string;
  try{origin=new URL(configured||request.url).origin}catch{origin=new URL(request.url).origin}
  const urls=publicPaths.map(path=>`  <url><loc>${origin}${path}</loc></url>`).join("\n");
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(xml,{headers:{"Content-Type":"application/xml; charset=utf-8","Cache-Control":"public, max-age=3600"}});
}
