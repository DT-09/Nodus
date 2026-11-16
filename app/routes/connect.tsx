import type { MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { MarketingShell } from "../components/MarketingShell";

export const meta: MetaFunction = () => [
  { title: "Connect Shopify — NODUS" },
  { name: "description", content: "Connect a Shopify store to NODUS for evidence-led shipping economics, reconciliation and policy analysis." },
];

export async function loader() {
  const required = ["SHOPIFY_API_KEY", "SHOPIFY_API_SECRET", "SHOPIFY_APP_URL", "DATABASE_URL", "DIRECT_URL"];
  const configured = required.every((key) => Boolean(process.env[key]?.trim()));
  const rawInstallUrl = process.env.NODUS_APP_STORE_URL?.trim() ?? "";
  let installUrl: string | null = null;
  try {
    const parsed = new URL(rawInstallUrl);
    if (parsed.protocol === "https:" && parsed.hostname === "apps.shopify.com") installUrl = parsed.toString();
  } catch { /* install link is not configured */ }
  const enabled = configured && process.env.NODUS_PUBLIC_INSTALL_ENABLED === "true" && Boolean(installUrl);
  return { enabled, configured, installUrl };
}

export default function Connect() {
  const { enabled, configured, installUrl } = useLoaderData<typeof loader>();
  return <MarketingShell active="connect"><main className="content-page">
    <header>
      <p className="page-eyebrow">NODUS / SHOPIFY INSTALLATION</p>
      <h1>Connect your store.<br/><em>Start with evidence.</em></h1>
      <p className="page-lede">NODUS is an embedded Shopify app. A store administrator installs it and grants the requested permissions inside Shopify. The workspace then connects order and fulfillment records with carrier-cost evidence supplied by the merchant.</p>
    </header>
    {enabled && installUrl ? <section className="content-note">
      <h2>Install NODUS</h2>
      <p>Continue to Shopify's app listing to review the permissions and install NODUS. Only a store administrator should approve the connection.</p>
      <a className="cta-primary" href={installUrl} rel="noreferrer">OPEN SHOPIFY INSTALL PAGE ↗</a>
    </section> : <section className="content-note">
      <h2>Merchant installation is not open yet</h2>
      <p>{configured ? "The production app credentials and database are present, but public installation remains disabled until the Shopify listing and release checks are approved." : "The production Shopify credentials and database are not configured. The public website is available, but the merchant workspace cannot authenticate or persist store data yet."}</p>
      <div className="connect-status" role="status">{configured ? "Shopify services configured · Public install gate closed" : "Shopify services not configured · Installation unavailable"}</div>
      <p>We will not ask a merchant to authorize an app that cannot complete its connection. The Founding Merchant Assessment describes the supported evaluation scope and required evidence.</p>
      <Link to="/pricing" className="cta-primary">REVIEW THE FOUNDING ASSESSMENT ↗</Link>
    </section>}
    <section className="content-note">
      <h2>No Shopify connection? Use manual data.</h2>
      <p>Upload an order CSV and a carrier-cost CSV for a browser-local evidence review. Files stay on the device and are not uploaded to NODUS. Download the review CSV or JSON pack. This manual route does not create a saved merchant workspace or recurring sync.</p>
      <Link to="/manual-data" className="cta-primary">START MANUAL DATA REVIEW ↗</Link>
    </section>
    <section className="content-note">
      <h2>What the merchant gets</h2>
      <ul>
        <li>Order-level shipping revenue and fulfillment evidence from Shopify.</li>
        <li>Carrier-cost CSV intake, evidence matching and a persistent exception work queue.</li>
        <li>Historical shipping-policy scenarios with explicit assumptions.</li>
        <li>CSV evidence exports and a JSON Shipping Economics Decision Pack.</li>
        <li>An economic outcome ledger that separates identified opportunities, validated outcomes and posted credits.</li>
      </ul>
      <p>Carrier invoices are not automatically polled. Direct carrier APIs, PDF invoice extraction, automatic carrier alerts, live policy writes and paid subscriptions are not currently available.</p>
    </section>
    <section className="content-note">
      <h2>Permission and control</h2>
      <p>NODUS requests read access to orders, products, fulfillments, shipping and markets. It does not ask for the merchant's Shopify password. Store authorization is handled by Shopify OAuth, and policy changes remain read-only.</p>
      <Link to="/privacy">READ PRIVACY AND DATA HANDLING ↗</Link>
    </section>
  </main></MarketingShell>;
}
