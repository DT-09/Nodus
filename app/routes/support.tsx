import type {MetaFunction} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
export const meta:MetaFunction=()=>[
 {title:"Support — NODUS"},
 {name:"description",content:"Private NODUS merchant enquiries and technical support."}
];
export default function Support(){
 const subject=encodeURIComponent("NODUS support or merchant enquiry");
 const body=encodeURIComponent("Hello NODUS,\n\nEnquiry type (merchant evaluation / technical support):\nShopify store domain (if relevant):\nAffected workflow and approximate time:\nRedacted error message (if relevant):\n\n");
 return <MarketingShell><main className="content-page"><header><p className="page-eyebrow">SUPPORT / MERCHANT ENQUIRIES</p><h1>Clear answers.<br/><em>Traceable issues.</em></h1><p className="page-lede">For a merchant evaluation, describe your Shopify store, approximate monthly order volume, carrier or 3PL cost format and the shipping question you need to answer.</p></header><section className="content-note"><h2>Private enquiries</h2><p>Never include access tokens, passwords, payment details, customer personal data or unredacted invoices.</p><a className="cta-primary" href={"mailto:dhairytopia@gmail.com?subject="+subject+"&body="+body}>CONTACT NODUS PRIVATELY ↗</a></section><section className="content-note"><h2>Technical issue tracker</h2><p>Use the public issue tracker only for reproducible defects and documentation corrections. Do not post confidential merchant data or security vulnerabilities.</p><a href="https://github.com/DT-09/Nodus/issues" target="_blank" rel="noreferrer">OPEN NODUS ISSUE TRACKER ↗</a></section></main></MarketingShell>;
}
