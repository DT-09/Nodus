import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
export const meta: MetaFunction = () => [{ title: "Support — NODUS" }, { name: "description", content: "NODUS merchant evaluation, support and issue reporting." }];
export async function loader(_args: LoaderFunctionArgs) {
  return { contactEmail: process.env.PUBLIC_CONTACT_EMAIL?.trim() || null };
}
export default function Support(){
  const { contactEmail } = useLoaderData<typeof loader>();
  const subject = encodeURIComponent("NODUS support or merchant enquiry");
  const body = encodeURIComponent("Hello NODUS,\n\nEnquiry type (merchant evaluation / technical support):\nShopify store domain (if relevant):\nAffected workflow and approximate time:\nRedacted error message (if relevant):\n\n");
  return <main className="public-page"><nav className="marketing-nav"><Link className="brand" to="/"><span className="brand-mark">N</span><span>NODUS<small>SHIPPING INTELLIGENCE</small></span></Link><div className="marketing-links"><Link to="/product">Product</Link><Link to="/methodology">Methodology</Link><Link to="/pricing">Pricing</Link><Link to="/security">Trust</Link></div><Link to="/app" className="nav-cta">Merchant sign in ↗</Link></nav>
    <header className="public-hero"><p className="eyebrow">SUPPORT / MERCHANT ENQUIRIES</p><h1>Clear answers.<br/>Traceable issues.</h1><p>For a merchant evaluation, describe your Shopify store, approximate monthly order volume, carrier or 3PL cost format and the shipping question you need to answer. For technical support, include the affected workflow, approximate time and a redacted error message.</p></header>
    <section className="public-note"><b>Private enquiries</b><p>Never include access tokens, passwords, payment details, customer personal data or unredacted invoices. Security vulnerabilities should not be reported in a public issue.</p>
      {contactEmail ? <a className="primary-cta" href={`mailto:${contactEmail}?subject=${subject}&body=${body}`} aria-label="Contact NODUS privately">Contact NODUS privately ↗</a> : <p className="import-error" role="status">Private enquiry intake is not configured. A business-owned contact channel must be set before public launch.</p>}
    </section><section className="public-note"><b>Technical issue tracker</b><p>Use the public issue tracker only for reproducible defects and documentation corrections. Do not post confidential merchant data.</p><a href="https://github.com/DT-09/Nodus/issues" rel="noreferrer">Open NODUS issue tracker ↗</a></section>
    <footer className="marketing-footer"><span>NODUS © 2026</span><span>Shipping economics intelligence</span><span><Link to="/security">Security</Link> · <Link to="/methodology">Methodology</Link></span></footer></main>
}