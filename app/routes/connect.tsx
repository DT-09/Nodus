import {useState} from "react";
import type {FormEvent} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";
export const meta:MetaFunction=()=>[
 {title:"Connect Shopify — NODUS"},
 {name:"description",content:"Review the Shopify connection status and start a local shipping-economics assessment with NODUS."}
];
export default function Connect(){
 const [shop,setShop]=useState("");
 const [error,setError]=useState("");
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setError("");const value=shop.trim().toLowerCase().replace(/^https?:\\/\\//,"").replace(/\\/$/,"");if(!/^[a-z0-9][a-z0-9-]*\\.myshopify\\.com$/.test(value)){setError("Enter your Shopify store's .myshopify.com domain.");return;}window.location.assign("/api/shopify/install?shop="+encodeURIComponent(value));}
 return <MarketingShell active="connect"><main className="content-page">
  <header><p className="page-eyebrow">NODUS / SHOPIFY CONNECTION</p><h1>Connect your store.<br/><em>Start with evidence.</em></h1><p className="page-lede">Connect a Shopify store through a read-only authorization flow. NODUS requests order access only; carrier cost evidence remains a separate import.</p></header>
  <section className="content-note"><h2>Connect your Shopify store</h2><p>Enter the permanent <code>.myshopify.com</code> domain. Shopify will show the permissions NODUS requests before you approve access.</p><form className="nd-connect-form" onSubmit={submit}><label htmlFor="shop-domain">SHOPIFY STORE DOMAIN</label><input id="shop-domain" value={shop} onChange={e=>setShop(e.currentTarget.value)} placeholder="your-store.myshopify.com" autoComplete="url" required/><button className="cta-primary" type="submit">CONTINUE TO SHOPIFY ↗</button>{error?<p role="alert" className="import-error">{error}</p>:null}</form><p className="footnote">Connection is available only after the NODUS Shopify app credentials have been configured. If the connection is not active yet, the page will explain what is missing.</p><Link to="/workspace" className="cta-secondary">OPEN MERCHANT WORKSPACE ↗</Link></section>
  <section className="content-note"><h2>Run a local data review</h2><p>Upload an order CSV and carrier-cost CSV. Matching and calculations happen in your browser. Files are not uploaded to NODUS; download the resulting CSV register and JSON decision pack.</p><Link to="/manual-data" className="cta-primary">OPEN MANUAL DATA WORKSPACE ↗</Link></section>
  <section className="content-note"><h2>What the local workflow supports</h2><ul><li>Order-level shipping revenue and carrier-cost evidence matching.</li><li>Matched, unmatched and incomplete evidence states.</li><li>Currency-separated calculations and downloadable review packs.</li><li>Historical policy simulation only where supported by supplied data.</li></ul><p>This release provides read-only Shopify order sync and a persistent merchant workspace once OAuth is configured. Carrier invoice intake, recurring carrier reconciliation, billing and automatic Shopify policy changes are not live.</p></section>
 </main></MarketingShell>;
}
