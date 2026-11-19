import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
const release="https://github.com/DT-09/Nodus/releases/latest/download/NODUS-Desktop-Windows-x64.exe";
export const meta:MetaFunction=()=>[{title:"Download NODUS — Desktop application"},{name:"description",content:"Download the NODUS Windows desktop application or use the browser workspace."}];
export default function Downloads(){
 return <MarketingShell active="downloads"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / DESKTOP APPLICATION</p><h1>Your operating workspace.<br/><em>On your desktop.</em></h1><p className="page-lede">NODUS Desktop is a Windows application that opens the NODUS merchant workspace in a dedicated desktop window. It requires an internet connection and Microsoft Edge WebView2 Runtime. Store data remains governed by the web application's authentication and authorization controls.</p></header>
  <section className="content-note"><h2>Windows 10 and 11 · x64</h2><p>Download the latest release build from the NODUS release channel. Each release includes a SHA-256 checksum for integrity verification.</p><a className="cta-primary" href={release}>DOWNLOAD NODUS FOR WINDOWS ↗</a><p className="footnote">The desktop client is an application shell for the online NODUS workspace, not an offline Shopify client or separate data-processing engine. If a release is not yet available, use the browser workspace.</p><p><Link to="/workspace">OPEN THE WEB WORKSPACE ↗</Link></p></section>
  <section className="content-note"><h2>What the desktop app does</h2><ul><li>Opens NODUS in its own Windows application window.</li><li>Uses the existing web authentication and merchant permissions.</li><li>Routes external links to the system browser.</li><li>Does not request unrestricted Shopify access or store Shopify credentials locally.</li></ul></section>
  <section className="content-note"><h2>Other devices</h2><p>Use the browser workspace on macOS, Linux, iOS and Android. The installable web app remains available from supported browsers.</p><Link to="/install">INSTALL THE WEB APP ↗</Link></section>
 </main></MarketingShell>;
}
