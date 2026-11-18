import {useEffect, useState, type ReactNode} from "react";
import {Link} from "react-router";

const groups = [
  {label:"NODUS", links:[["Operating system","/"],["Product architecture","/product"],["Install NODUS","/install"],["Connect Shopify","/connect"],["Current capabilities","/shipping-cost-reconciliation"]]},
  {label:"EVALUATE", links:[["Product walkthrough","/demo"],["Founding assessment","/pricing"],["Merchant evaluation guide","/buyer-evaluation"],["Methodology","/methodology"]]},
  {label:"TRUST", links:[["Security & data","/security"],["Privacy & data handling","/privacy"],["Support","/support"],["GitHub","https://github.com/DT-09/Nodus"]]},
] as const;

function NodusLogo(){return <svg className="nodus-logo" viewBox="0 0 100 100" role="img" aria-label="NODUS six-node geometric mark"><g fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round"><path d="M50 8 84 29 84 71 50 92 16 71 16 29 50 8Z"/><path d="M50 8 50 50 84 71M50 50 16 71M16 29 50 50 84 29M50 50 50 92"/></g><g fill="currentColor"><circle cx="50" cy="8" r="4.2"/><circle cx="84" cy="29" r="4.2"/><circle cx="84" cy="71" r="4.2"/><circle cx="50" cy="92" r="4.2"/><circle cx="16" cy="71" r="4.2"/><circle cx="16" cy="29" r="4.2"/></g></svg>}

export function MarketingShell({children, active="home"}:{children:ReactNode;active?:string}) {
 const [menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>{
  const root=document.querySelector(".marketing-site");
  const targets=Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
  if(!root||targets.length===0||!("IntersectionObserver" in window))return;
  root.setAttribute("data-motion-ready","true");
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.setAttribute("data-visible","true");observer.unobserve(entry.target)}}},{threshold:0.12,rootMargin:"0px 0px -7% 0px"});
  targets.forEach(target=>observer.observe(target));
  return()=>observer.disconnect();
 },[]);
 useEffect(()=>{const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenuOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);
 return <div className="marketing-site" data-theme="dark" data-page={active}>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header">
   <Link className="site-brand" to="/" aria-label="NODUS home"><NodusLogo/><span className="site-brand-word">NODUS</span><span className="site-brand-caption">BUSINESS INTELLIGENCE SYSTEMS</span></Link>
   <div className="site-header-right"><span className="header-context">BUSINESS / INTELLIGENCE / EXECUTION</span><button className={"menu-trigger"+(menuOpen?" is-open":"")} type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?"Close navigation":"Open navigation"}><span></span><span></span><span></span></button></div>
   {menuOpen?<><button className="menu-scrim" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}></button><nav className="site-menu" id="site-menu" aria-label="Main navigation"><div className="menu-topline"><span>EXPLORE NODUS</span><span>01 — 03</span></div><div className="menu-groups">{groups.map(group=><section className="menu-group" key={group.label}><p>{group.label}</p>{group.links.map(([label,to])=>to.startsWith("http")?<a key={label} href={to} target="_blank" rel="noreferrer" onClick={()=>setMenuOpen(false)}>{label}<span>↗</span></a>:<Link key={label} to={to} onClick={()=>setMenuOpen(false)}>{label}<span>↗</span></Link>)}</section>)}</div><div className="menu-bottom"><div><span className="menu-status-dot"></span><span>Evidence before recommendation.</span></div><div className="menu-actions"><Link to="/install" className="menu-cta menu-cta-secondary" onClick={()=>setMenuOpen(false)}>INSTALL NODUS <span>↗</span></Link><Link to="/pricing" className="menu-cta" onClick={()=>setMenuOpen(false)}>FOUNDING ASSESSMENT <span>↗</span></Link></div></div></nav></>:null}
  </header>
  <div id="main-content">{children}</div>
  <footer className="site-footer">
   <div className="footer-main">
    <div className="footer-identity"><Link to="/" className="footer-wordmark"><NodusLogo/>NODUS<span>®</span></Link><p>Business intelligence for Shopify commerce.<br/>Shipping economics. Evidence-led decisions.<br/>Clear findings. Controlled next steps.</p><Link to="/product" className="footer-cta">EXPLORE THE SYSTEM <span>↗</span></Link></div>
    <div className="footer-column"><p>PLATFORM</p><Link to="/">Operating system</Link><Link to="/product">Architecture</Link><Link to="/shipping-cost-reconciliation">Current product</Link><Link to="/install">Install app</Link><Link to="/connect">Connect Shopify</Link></div>
    <div className="footer-column"><p>EXPLORE</p><Link to="/demo">Product walkthrough</Link><Link to="/pricing">Founding assessment</Link><Link to="/buyer-evaluation">Merchant evaluation</Link><Link to="/methodology">Methodology</Link></div>
    <div className="footer-column"><p>TRUST</p><Link to="/security">Security & data</Link><Link to="/privacy">Privacy</Link><Link to="/support">Support</Link><a href="https://github.com/DT-09/Nodus" target="_blank" rel="noreferrer">Repository ↗</a></div>
   </div>
   <div className="footer-bottom"><span>© {new Date().getFullYear()} NODUS. All rights reserved.</span><span>BUILT AROUND TRACEABLE EVIDENCE</span><span><Link to="/security">Security</Link><Link to="/support">Contact</Link></span></div>
  </footer>
 </div>;
}
