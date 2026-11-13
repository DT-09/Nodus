import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => [
  { title: "NODUS — Shipping economics intelligence for Shopify" },
  { name: "description", content: "Reconcile shipping revenue with carrier-cost evidence, diagnose operational gaps and evaluate policy changes before they reach checkout." },
  { property: "og:title", content: "NODUS — The intelligence behind shipping decisions" },
  { property: "og:description", content: "Evidence before recommendation. Approval before execution. Verification after execution." },
];

const steps = [
  ["01", "Connect", "Bring Shopify orders and supported shipping records into one merchant-scoped workspace."],
  ["02", "Reconcile", "Match carrier and 3PL cost evidence to orders without silently allocating ambiguous charges."],
  ["03", "Diagnose", "Trace exceptions to source records, calculations, coverage and rule explanations."],
  ["04", "Simulate", "Replay proposed shipping rates against historical baskets. See the assumptions and exclusions."],
  ["05", "Control", "Review a proposed change and require explicit merchant approval before supported execution."],
  ["06", "Verify", "Read the configuration back and monitor observed outcomes after the change."],
];

export default function Home() {
  return <main className="marketing">
    <nav className="marketing-nav">
      <a className="brand" href="/"><span className="brand-mark">N</span><span>NODUS<small>SHIPPING INTELLIGENCE</small></span></a>
      <div className="marketing-links"><Link to="/product">Product</Link><Link to="/methodology">Methodology</Link><Link to="/pricing">Pricing</Link><Link to="/security">Trust</Link></div>
      <Link to="/app" className="nav-cta">Merchant sign in ↗</Link>
    </nav>
    <section className="hero">
      <p className="eyebrow">SHOPIFY SHIPPING ECONOMICS / POLICY INTELLIGENCE</p>
      <h1>Shipping decisions,<br/><em>with the evidence attached.</em></h1>
      <p className="hero-copy">Understand what shipping costs. Find where policy breaks down. Test better decisions against real order history—and verify the changes you approve.</p>
      <div className="hero-actions"><Link to="/app" className="primary-cta">Open merchant workspace ↗</Link><Link to="/product">Explore the product →</Link></div>
      <div className="hero-rule"><span>OBSERVE</span><span>RECONCILE</span><span>DIAGNOSE</span><span>SIMULATE</span><span>CONTROL</span><span>VERIFY</span></div>
    </section>
    <section className="marketing-section">
      <p className="eyebrow">THE NODUS OPERATING LOOP</p><h2>From fragmented shipping data<br/>to controlled decisions.</h2>
      <div className="marketing-grid">{steps.map(([n,title,body]) => <article key={n}><span>{n}</span><h3>{title}</h3><p>{body}</p></article>)}</div>
    </section>
    <section className="proof-section">
      <div><p className="eyebrow">BUILT FOR OPERATIONAL CLARITY</p><h2>Not another shipping dashboard.</h2><p>Dashboards show totals. NODUS is designed to connect each finding to its source, explain what is known, separate assumptions from facts and keep production changes under merchant control.</p></div>
      <div className="proof-list"><p><b>01</b><span>Every financial result has a traceable evidence path.</span></p><p><b>02</b><span>Missing evidence stays missing. It is never treated as zero cost.</span></p><p><b>03</b><span>Historical replay is not dressed up as a conversion forecast.</span></p><p><b>04</b><span>No configuration write without explicit approval and verification.</span></p></div>
    </section>
    <section className="closing-cta"><p className="eyebrow">A BETTER SHIPPING DECISION STARTS WITH A BETTER RECORD</p><h2>Know the economics.<br/>Keep control of the policy.</h2><Link to="/app" className="primary-cta">Enter NODUS ↗</Link></section>
    <footer className="marketing-footer"><span>NODUS © 2026</span><span>Shipping economics intelligence</span><span><Link to="/methodology">Methodology</Link> · <Link to="/security">Security</Link> · <Link to="/support">Support</Link></span></footer>
  </main>;
}
