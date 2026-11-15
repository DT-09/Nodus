import type {LinksFunction} from "react-router";
import {Links,Meta,Outlet,Scripts,ScrollRestoration,isRouteErrorResponse,useRouteError} from "react-router";
import css from "./styles.css?url";
import marketingCss from "./marketing.css?url";
import {NODUS_MARK} from "./components/nodus-mark";
export const links:LinksFunction=()=>[
  {rel:"stylesheet",href:css},
  {rel:"stylesheet",href:marketingCss},
  {rel:"icon",href:NODUS_MARK,type:"image/png"},
  {rel:"apple-touch-icon",href:NODUS_MARK},
];
export default function Root(){
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
