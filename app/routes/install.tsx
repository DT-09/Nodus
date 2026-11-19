import {useEffect,useState} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

type InstallPromptEvent=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:"accepted"|"dismissed";platform:string}>};

function InstallAction(){
 const [promptEvent,setPromptEvent]=useState<InstallPromptEvent|null>(null);
 const [installed,setInstalled]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  const standalone=window.matchMedia?.("(display-mode: standalone)").matches??false;
  setInstalled(standalone);
  const onPrompt=(event:Event)=>{event.preventDefault();setPromptEvent(event as InstallPromptEvent);};
  const onInstalled=()=>{setInstalled(true);setPromptEvent(null);setMessage("NODUS is installed on this device.");};
  window.addEventListener("beforeinstallprompt",onPrompt);
  window.addEventListener("appinstalled",onInstalled);
  return()=>{window.removeEventListener("beforeinstallprompt",onPrompt);window.removeEventListener("appinstalled",onInstalled);};
 },[]);
 async function install(){
  if(!promptEvent)return;
  await promptEvent.prompt();
  const choice=await promptEvent.userChoice;
  setMessage(choice.outcome==="accepted"?"Installation started. Open NODUS from your device's app launcher.":"Installation was dismissed. You can install later from your browser menu.");
  setPromptEvent(null);
 }
 return <div className="install-action">
  {installed?<p className="install-status" role="status">NODUS is installed on this device.</p>:promptEvent?<button type="button" className="cta-primary" onClick={()=>void install()}>INSTALL NODUS ↗</button>:<p className="install-help">Your browser may offer installation from its address bar or menu. Follow the device instructions below.</p>}
  {message?<p className="install-help" role="status">{message}</p>:null}
 </div>;
}

export const meta:MetaFunction=()=>[
 {title:"Install NODUS — The shipping economics web app"},
 {name:"description",content:"Install NODUS as a progressive web app on a supported browser. Use the browser-local shipping economics CSV review."},
];

export default function Install(){
 return <MarketingShell active="install"><main className="content-page install-page">
  <header><p className="page-eyebrow">NODUS / INSTALLABLE WEB APP</p><h1>Install NODUS.<br/><em>Open it like an app.</em></h1><p className="page-lede">NODUS is delivered as a progressive web app (PWA). Install it from a supported browser to open the product in its own window. The current working tool analyses order and carrier-cost CSV files locally in your browser.</p><InstallAction/></header>
  <section className="content-note"><h2>Prefer a desktop application?</h2><p>The dedicated Windows desktop client is distributed separately from the browser install flow.</p><Link to="/downloads" className="cta-primary">DOWNLOAD NODUS DESKTOP ↗</Link></section>
  <section className="content-note"><h2>Windows, macOS and Linux</h2><p>Open NODUS in Chrome or Edge. Select the install icon in the address bar, or open the browser menu and choose <strong>Install NODUS</strong>. The app then appears in your app launcher or applications list.</p></section>
  <section className="content-note"><h2>iPhone and iPad</h2><p>Open NODUS in Safari. Tap <strong>Share</strong>, choose <strong>Add to Home Screen</strong>, then confirm. Open NODUS from the new home-screen icon.</p></section>
  <section className="content-note"><h2>Android</h2><p>Open NODUS in Chrome. Choose <strong>Install app</strong> when prompted, or open the browser menu and select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p></section>
  <section className="content-note"><h2>What the installed app does</h2><ul><li>Opens the NODUS product website in a standalone app window.</li><li>Runs the shipping-economics CSV review in your browser.</li><li>Exports a CSV review register and a JSON decision pack from the browser.</li><li>Does not upload the selected CSV files as part of the analysis.</li></ul></section>
  <section className="content-note"><h2>Offline behaviour</h2><p>The service worker can show the NODUS offline status page when a network request fails. The CSV tool itself needs the app to load; no merchant records or analysis results are stored for offline use.</p></section>
  <section className="content-note"><h2>What this is—and is not</h2><p>This is an installable web app, not a native Windows .exe, macOS .dmg, Android .apk or App Store / Google Play package. There is no separate installer download. Installation is handled by the browser and depends on browser and operating-system support.</p><div className="hero-ctas"><Link to="/manual-data" className="cta-primary">OPEN THE CSV REVIEW TOOL ↗</Link><Link to="/buyer-evaluation" className="cta-secondary">REQUEST A FOUNDING ASSESSMENT ↗</Link></div></section>
 </main></MarketingShell>;
}
