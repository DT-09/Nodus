import {NODUS_MARK} from "./nodus-mark";
import {useEffect, useState, type ReactNode} from "react";
import {Link} from "react-router";

const groups = [
  {label:"PLATFORM", links:[["The platform","/product"],["Evidence & reconciliation","/product#evidence"],["Shipping economics","/product#economics"],["Policy intelligence","/product#policy"]]},
  {label:"EXPLORE", links:[["Product walkthrough","/demo"],["Merchant evaluation guide","/buyer-evaluation"],["How NODUS works","/methodology"],["Pricing & evaluation","/pricing"]]},
  {label:"TRUST", links:[["Security & data","/security"],["Privacy & data handling","/privacy"],["Support","/support"],["GitHub","https://github.com/DT-09/Nodus"]]},
] as const;

export function MarketingShell({children, active="home"}:{children:ReactNode;active?:string}) {
  const [theme,setTheme]=useState<"dark"|"light">("dark");
  const [menuOpen,setMenuOpen]=useState(false);
  useEffect(()=>{
    const saved=window.localStorage.getItem("nodus-site-theme");
    if(saved==="light"||saved==="dark") setTheme(saved);
  },[]);
  useEffect(()=>{
    const root=document.querySelector(".marketing-site");
    const targets=Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if(!root||targets.length===0)return;
    if(!("IntersectionObserver" in window))return;
    root.setAttribute("data-motion-ready","true");
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){entry.target.setAttribute("data-visible","true");observer.unobserve(entry.target)}
      }
    },{threshold:0.12,rootMargin:"0px 0px -7% 0px"});
    targets.forEach(target=>observer.observe(target));
    return ()=>observer.disconnect();
  },[]);
  useEffect(()=>{
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setMenuOpen(false)};
    window.addEventListener("keydown",close);
    return ()=>window.removeEventListener("keydown",close);
  },[]);
  function toggleTheme(){
    const next=theme==="dark"?"light":"dark";
    setTheme(next);
    window.localStorage.setItem("nodus-site-theme",next);
  }
  return <div className="marketing-site" data-theme={theme} data-page={active}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="NODUS home">
        <img className="site-brand-mark" src={NODUS_MARK} alt="" /><span className="site-brand-word">NODUS</span>
        <span className="site-brand-caption">SHIPPING INTELLIGENCE</span>
      </Link>
      <div className="site-header-right">
        <span className="header-context">SHOPIFY / SHIPPING ECONOMICS</span>
        <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label={theme==="dark"?"Switch to light appearance":"Switch to dark appearance"} title={theme==="dark"?"Switch to light appearance":"Switch to dark appearance"}>
          <span aria-hidden="true">{theme==="dark"?"◐":"◑"}</span><span className="theme-toggle-label">{theme==="dark"?"LIGHT":"DARK"}</span>
        </button>
        <button className={"menu-trigger"+(menuOpen?" is-open":"")} type="button" aria-expanded={menuOpen} aria-controls="site-menu" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?"Close navigation":"Open navigation"}>
          <span></span><span></span><span></span>
        </button>
      </div>
      {menuOpen?<>
        <button className="menu-scrim" aria-label="Close navigation" onClick={()=>setMenuOpen(false)}></button>
        <nav className="site-menu" id="site-menu" aria-label="Main navigation">
          <div className="menu-topline"><span>EXPLORE NODUS</span><span>01 — 03</span></div>
          <div className="menu-groups">
            {groups.map(group=><section className="menu-group" key={group.label}><p>{group.label}</p>{group.links.map(([label,to])=>to.startsWith("http")?<a key={label} href={to} target="_blank" rel="noreferrer" onClick={()=>setMenuOpen(false)}>{label}<span>↗</span></a>:<Link key={label} to={to} onClick={()=>setMenuOpen(false)}>{label}<span>↗</span></Link>)}</section>)}
          </div>
          <div className="menu-bottom"><div><span className="menu-status-dot"></span><span>Evidence before recommendation.</span></div><Link to="/app" className="menu-cta" onClick={()=>setMenuOpen(false)}>CONNECT SHOPIFY <span>↗</span></Link></div>
        </nav>
      </>:null}
    </header>
    <div id="main-content">{children}</div>
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-identity"><Link to="/" className="footer-wordmark"><img src={NODUS_MARK} alt="" />NODUS<span>®</span></Link><p>Shipping economics intelligence.<br/>Evidence before recommendation.<br/>Approval before execution.</p><Link to="/product" className="footer-cta">EXPLORE THE PLATFORM <span>↗</span></Link></div>
        <div className="footer-column"><p>PLATFORM</p><Link to="/product">Overview</Link><Link to="/product#evidence">Evidence</Link><Link to="/product#economics">Economics</Link><Link to="/product#policy">Policy intelligence</Link></div>
        <div className="footer-column"><p>KNOWLEDGE</p><Link to="/demo">Sample reconciliation</Link><Link to="/buyer-evaluation">Merchant evaluation guide</Link><Link to="/methodology">Methodology</Link><Link to="/pricing">Pricing & evaluation</Link><Link to="/security">Security</Link><Link to="/privacy">Privacy & data</Link><Link to="/support">Support</Link></div>
        <div className="footer-column"><p>COMPANY</p><Link to="/about">About NODUS</Link><a href="https://github.com/DT-09/Nodus" target="_blank" rel="noreferrer">Open-source record ↗</a><Link to="/app">Merchant workspace</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} NODUS. All rights reserved.</span><span>BUILT AROUND TRACEABLE EVIDENCE</span><span><Link to="/security">Security & data</Link><Link to="/support">Contact</Link></span></div>
    </footer>
  </div>;
}
