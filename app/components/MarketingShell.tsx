import {useEffect, useState, type ReactNode} from "react";
import {Link} from "react-router";

const groups = [
  {label:"PLATFORM", links:[["The platform","/product"],["Shipping cost reconciliation","/shipping-cost-reconciliation"],["Evidence & reconciliation","/product#evidence"],["Shipping economics","/product#economics"],["Policy intelligence","/product#policy"]]},
  {label:"EXPLORE", links:[["Product walkthrough","/demo"],["Merchant evaluation guide","/buyer-evaluation"],["Shipping cost reconciliation guide","/guides/shopify-shipping-cost-reconciliation"],["Free-shipping threshold guide","/guides/free-shipping-threshold-analysis"],["How NODUS works","/methodology"],["Pricing & evaluation","/pricing"]]},
  {label:"TRUST", links:[["Security & data","/security"],["Privacy & data handling","/privacy"],["Support","/support"],["GitHub","https://github.com/DT-09/Nodus"]]},
] as const;

function NodusLogo(){return <svg className="nodus-logo" viewBox="0 0 40 40" role="img" aria-label="NODUS mark"><g fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round"><path d="M20 4 34 13 29 31 20 36 6 27 6 13 20 4Z"/><path d="M6 13 20 21 34 13M20 21v15M11 29l9-8 9 8M11 11l9 10 9-10"/></g><g fill="currentColor"><circle cx="20" cy="4" r="2.3"/><circle cx="34" cy="13" r="2.3"/><circle cx="29" cy="31" r="2.3"/><circle cx="20" cy="36" r="2.3"/><circle cx="6" cy="27" r="2.3"/><circle cx="6" cy="13" r="2.3"/><circle cx="20" cy="21" r="2.2"/></g></svg>}

export function MarketingShell({children, active="home"}:{children:ReactNode;active?:string}) {
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
  return <div className="marketing-site" data-theme="light" data-page={active}>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="site-header">
      <Link className="site-brand" to="/" aria-label="NODUS home">
        <NodusLogo/><span className="site-brand-word">NODUS</span>
        <span className="site-brand-caption">SHIPPING INTELLIGENCE</span>
      </Link>
      <div className="site-header-right">
        <span className="header-context">SHOPIFY / SHIPPING ECONOMICS</span>
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
        <div className="footer-column"><p>PLATFORM</p><Link to="/product">Overview</Link><Link to="/shipping-cost-reconciliation">Shipping cost reconciliation</Link><Link to="/product#evidence">Evidence</Link><Link to="/product#economics">Economics</Link><Link to="/product#policy">Policy intelligence</Link></div>
        <div className="footer-column"><p>KNOWLEDGE</p><Link to="/demo">Sample reconciliation</Link><Link to="/buyer-evaluation">Merchant evaluation guide</Link><Link to="/guides/shopify-shipping-cost-reconciliation">Shipping cost reconciliation</Link><Link to="/guides/free-shipping-threshold-analysis">Free-shipping threshold analysis</Link><Link to="/methodology">Methodology</Link><Link to="/pricing">Pricing & evaluation</Link><Link to="/security">Security</Link><Link to="/privacy">Privacy & data</Link><Link to="/support">Support</Link></div>
        <div className="footer-column"><p>COMPANY</p><Link to="/about">About NODUS</Link><a href="https://github.com/DT-09/Nodus" target="_blank" rel="noreferrer">Open-source record ↗</a><Link to="/app">Merchant workspace</Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} NODUS. All rights reserved.</span><span>BUILT AROUND TRACEABLE EVIDENCE</span><span><Link to="/security">Security & data</Link><Link to="/support">Contact</Link></span></div>
    </footer>
  </div>;
}
