import type {LinksFunction} from "react-router";
import {useEffect} from "react";
import {Links,Meta,Outlet,Scripts,ScrollRestoration,isRouteErrorResponse,useRouteError} from "react-router";
import css from "./styles.css?url";
import marketingCss from "./marketing.css?url";
import nodusThemeCss from "./nodus-theme.css?url";
export const links:LinksFunction=()=>[
  {rel:"stylesheet",href:css},
  {rel:"stylesheet",href:marketingCss},
  {rel:"stylesheet",href:nodusThemeCss},
  {rel:"preconnect",href:"https://fonts.googleapis.com"},
  {rel:"preconnect",href:"https://fonts.gstatic.com",crossOrigin:"anonymous"},
  {rel:"stylesheet",href:"https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Syncopate:wght@400;700&display=swap"},
  {rel:"icon",href:"/nodus-icon.svg",type:"image/svg+xml"},
  {rel:"apple-touch-icon",href:"/nodus-icon.svg"},
  {rel:"manifest",href:"/manifest.webmanifest"},
];
export default function Root(){
  useEffect(()=>{if("serviceWorker" in navigator)navigator.serviceWorker.register("/sw.js",{scope:"/"}).catch(()=>{});},[]);
  return <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1"/>
      <meta property="og:site_name" content="NODUS"/>
      <meta property="og:type" content="website"/>
      <meta name="twitter:card" content="summary"/>
      <meta name="theme-color" content="#101820"/>
      <Meta/>
      <Links/>
    </head>
    <body>
      <Outlet/>
      <ScrollRestoration/>
      <Scripts/>
    </body>
  </html>;
}
export function ErrorBoundary(){
  const error=useRouteError();
  const status=isRouteErrorResponse(error)?error.status:500;
  const message=process.env.NODE_ENV==="production"
    ? "The request could not be completed. Please try again. If the problem persists, contact NODUS support with the approximate time."
    : isRouteErrorResponse(error)
      ? error.statusText
      : error instanceof Error
        ? error.message
        : "Unexpected application error";
  return <main className="error-page">
    <p className="eyebrow">NODUS / SYSTEM MESSAGE</p>
    <h1>Something went wrong.</h1>
    <p role="status">{message}</p>
    <p className="muted">Reference: HTTP {status}</p>
    <a href="/">Return to NODUS</a>
  </main>;
}
