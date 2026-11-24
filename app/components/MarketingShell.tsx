import {useEffect,useState,type ReactNode} from "react";
import {Link} from "react-router";
import {NODUS_MARK} from "./nodus-mark";
const groups=[
 {label:"PRODUCT",links:[["The shipping review","/product"],["How matching works","/methodology"],["Sample ledger","/demo"]]},
 {label:"YOUR WEEK",links:[["Free 7-day experience","/control-week"],["Run your own files","/manual-data"],["For Shopify merchants","/buyer-evaluation"]]},
 {label:"COMPANY",links:[["Pricing","/pricing"],["Security","/security"],["Support","/support"]]}
] as const;
function NodusLogo(){return <img className="nodus-logo" src={NODUS_MARK} alt="NODUS network mark"/>;}
export function MarketingShell({children,active="home"}:{children:ReactNode;active?:string}){
 const [menuOpen,setMenuOpen]=useState(false);
 useEffect(()=>{const root=document.querySelector(".marketing-site");if(!root)return;const blocks=Array.from(document.querySelectorAll<HTMLElement>("#main-content main > section, #main-content main > header"));blocks.forEach((el,i)=>{el.setAttribute("data-reveal","");el.style.setProperty("--reveal-index",String(Math.min(i,7)));});const targets=Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));if(!targets.length||!("IntersectionObserver" in window))return;root.setAttribute("data-motion-ready","true");const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.setAttribute("data-visible","true");observer.unobserve(entry.target);}}),{threshold:.1,rootMargin:"0px 0px -6% 0px"});targets.forEach(el=>observer.observe(el));return()=>observer.disconnect();},[]);
 useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setMenuOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[]);
 return <div className="marketing-site" data-theme="dark" data-page={active}>
  <a className="skip-link" href="#main-content">Skip to content</a>
  <header className="site-header nd-nav">
   <Link className="site-brand nd-brand" to="/" aria-label="NODUS home"><NodusLogo/><span className="site-brand-copy"><span className="site-brand-word">NODUS</span><span className="site-brand-caption">SHIPPING COST CONTROL</span></span></Link>
   <nav className="nd-nav-links" aria-label="Primary navigation"><Link to="/product">Product</Link><Link to="/control-week">Free week</Link><Link to="/pricing">Pricing</Link></nav>
   <div className="site-header-right nd-nav-right"><Link to="/control-week" className="nd-nav-cta">Start free <span>↗</span></Link><button className={"menu-trigger"+(menuOpen?" is-open":"")} type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?"Close navigation":"Open navigation"}><span></span><span></span><span></span></button></div>
   {menuOpen?<><button className="menu-scrim" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}></button><nav className="site-menu" id="site-menu" aria-label="Full navigation"><div className="menu-topline"><span>EXPLORE NODUS</span><span>01 — 03</span></div><div className="menu-groups">{groups.map(group=><section className="menu-group" key={group.label}><p>{group.label}</p>{group.links.map(([label,to])=><Link key={label} to={to} onClick={()=>setMenuOpen(false)}>{label}<span>↗</span></Link>)}</section>)}</div><div className="menu-bottom"><div><span className="menu-status-dot"></span><span>Shipping costs, in view.</span></div><div className="menu-actions"><Link to="/control-week" className="menu-cta" onClick={()=>setMenuOpen(false)}>START THE FREE WEEK <span>↗</span></Link></div></div></nav></>:null}
  </header>
  <div id="main-content">{children}</div>
  <footer className="site-footer nd-footer"><div className="footer-main"><div className="footer-identity"><Link to="/" className="footer-wordmark"><NodusLogo/><span className="footer-wordmark-copy"><span className="footer-wordmark-label">NODUS</span><span className="footer-wordmark-caption">SHIPPING COST CONTROL</span></span></Link><p>Know what customers paid.<br/>Know what delivery cost.<br/>Keep the evidence behind the difference.</p><Link to="/control-week" className="footer-cta">START THE FREE WEEK <span>↗</span></Link></div><div className="footer-column"><p>PRODUCT</p><Link to="/product">The shipping review</Link><Link to="/demo">Sample ledger</Link><Link to="/methodology">Matching rules</Link></div><div className="footer-column"><p>MERCHANTS</p><Link to="/control-week">Free 7-day experience</Link><Link to="/manual-data">Run your own files</Link><Link to="/pricing">Pricing</Link></div><div className="footer-column"><p>COMPANY</p><Link to="/security">Security</Link><Link to="/privacy">Privacy</Link><Link to="/support">Support</Link></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} NODUS</span><span>BUILT FOR TRACEABLE SHIPPING COSTS</span><span><Link to="/privacy">Privacy</Link><Link to="/support">Contact</Link></span></div></footer>
 </div>;
}
