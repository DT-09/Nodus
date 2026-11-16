import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
  {title:"Install NODUS — Desktop, iPhone, iPad and Android"},
  {name:"description",content:"Install the NODUS web app on supported desktop and mobile devices. One app, no separate download."},
];

export default function Install(){
 return <MarketingShell active="install"><main className="content-page install-page">
  <header><p className="page-eyebrow">NODUS / CROSS-DEVICE APP</p><h1>One workspace.<br/><em>Your device.</em></h1><p className="page-lede">NODUS is delivered as an installable web app. Use the same secure workspace on desktop, iPhone, iPad and Android—without maintaining separate app builds.</p></header>
  <section className="content-note"><h2>Install on desktop</h2><p>Open NODUS in Chrome or Edge. Use the install icon in the address bar, or open the browser menu and choose <strong>Install NODUS</strong> / <strong>Apps → Install this site as an app</strong>. The app opens in its own window.</p></section>
  <section className="content-note"><h2>Install on iPhone or iPad</h2><p>Open NODUS in Safari. Tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then confirm. Launch NODUS from the new home-screen icon.</p></section>
  <section className="content-note"><h2>Install on Android</h2><p>Open NODUS in Chrome. Tap <strong>Install app</strong> if prompted, or open the browser menu and choose <strong>Install app</strong> / <strong>Add to Home screen</strong>.</p></section>
  <section className="content-note"><h2>What works offline?</h2><p>The install shell and a connection-status page are available offline. Shopify authentication, merchant records, reconciliation and reports require an internet connection. Sensitive merchant data is not cached for offline viewing.</p></section>
  <section className="content-note"><h2>Start using NODUS</h2><p>Installation gives you the app shell. To use the merchant workspace, connect an authorized Shopify store or run a local manual-data review.</p><div className="hero-ctas"><Link to="/connect" className="cta-primary">CONNECT SHOPIFY ↗</Link><Link to="/manual-data" className="cta-secondary">ANALYSE MANUAL DATA ↗</Link></div></section>
  <p className="footnote">This is a progressive web app, not a native binary distributed through the Apple App Store or Google Play. Browser and operating-system support can vary by version.</p>
 </main></MarketingShell>;
}
