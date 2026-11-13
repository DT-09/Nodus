import type { MetaFunction } from "react-router";
import { Link } from "react-router";
export const meta: MetaFunction = () => [{ title: "Product — NODUS" }, { name: "description", content: "Explore the NODUS shipping economics and policy-control workflow." }];
const modules = [
["Shipping revenue", "Read order shipping charges and order context from the connected Shopify store. Coverage and sample windows remain visible."],
["Cost evidence", "Import supported carrier-cost CSV records with invoice-line identity, currency validation and duplicate protection."],
["Reconciliation", "Match by exact order reference or unambiguous tracking number. Unmatched and currency-mismatched records remain outside totals."],
["Diagnostics", "Surface missing evidence and supported cost exceptions with deterministic rule IDs and source references."],
["Historical simulation", "Compare a proposed flat rate and threshold against persisted order baskets. The replay does not predict conversion or profit."],
["Policy governance", "Keep configuration read-only until a supported mutation, merchant approval, baseline check and read-back verification are implemented and tested."],
];
export default function Product(){return <main className="public-page"><PublicNav/><header className="public-hero"><p className="eyebrow">PRODUCT / CAPABILITIES</p><h1>One connected record<br/>for shipping decisions.</h1><p>Shipping economics is not a single metric. It is a chain of orders, charges, labels, invoices, exceptions and configuration choices. NODUS is built to make that chain inspectable.</p></header><section className="public-grid">{modules.map(([title,body],i)=><article key={title}><span>0{i+1}</span><h2>{title}</h2><p>{body}</p></article>)}</section><section className="public-note"><b>Capability boundary</b><p>Only features enabled in the authenticated workspace are available. A documented workflow is not a claim that every external integration or policy mutation is live.</p><Link to="/methodology">Read the methodology →</Link></section><PublicFooter/></main>}
function PublicNav(){return <nav className="marketing-nav"><Link className="brand" to="/"><span className="brand-mark">N</span><span>NODUS<small>SHIPPING INTELLIGENCE</small></span></Link><div className="marketing-links"><Link to="/product">Product</Link><Link to="/methodology">Methodology</Link><Link to="/pricing">Pricing</Link><Link to="/security">Trust</Link></div><Link to="/app" className="nav-cta">Merchant sign in ↗</Link></nav>}
function PublicFooter(){return <footer className="marketing-footer"><span>NODUS © 2026</span><span>Shipping economics intelligence</span><span><Link to="/support">Support</Link> · <Link to="/security">Security</Link></span></footer>}
