import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { MarketingShell } from "../components/MarketingShell";

export const meta: MetaFunction = () => [
  { title: "Privacy & data handling — NODUS" },
  { name: "description", content: "How NODUS processes Shopify store, order and carrier-cost evidence during merchant evaluations." },
];

export async function loader(_args: LoaderFunctionArgs) {
  return { contactEmail: process.env.PUBLIC_CONTACT_EMAIL?.trim() || null };
}

export default function Privacy() {
  const { contactEmail } = useLoaderData<typeof loader>();
  const subject = encodeURIComponent("NODUS privacy and data request");
  const body = encodeURIComponent("Hello NODUS,\n\nShopify store domain:\nRequest type (access / deletion / other):\nDetails:\n\n");
  const contactHref = contactEmail ? "mailto:" + contactEmail + "?subject=" + subject + "&body=" + body : null;

  return <MarketingShell><main className="content-page">
    <header>
      <p className="page-eyebrow">PRIVACY / DATA HANDLING</p>
      <h1>Know what data<br />the system handles.</h1>
      <p className="page-lede">NODUS processes Shopify store and shipping records to provide order-level shipping economics analysis. This page describes the current application behaviour; the responsible business operator must review and complete it before public merchant use.</p>
    </header>
    <section className="content-note">
      <h2>Data processed</h2>
      <ul>
        <li>Shop identity, shop name, installation state and Shopify authorization/session data, including access credentials needed to call the Shopify API.</li>
        <li>Shopify order identifiers and names, order dates, currency, shipping revenue, tax/subtotal context, fulfillment tracking references and the source order payload imported by the app. Source payloads may contain personal information present in the Shopify order.</li>
        <li>Merchant-provided carrier-cost CSV records, including invoice and charge identifiers, order or tracking references, amounts, currencies, dates and source labels.</li>
        <li>Merchant review decisions, reconciliation records, policy simulations, economic-value entries and audit events created while using the app.</li>
        <li>Technical synchronization and webhook-processing state used to operate the service.</li>
      </ul>
    </section>
    <section className="content-note">
      <h2>Why it is processed</h2>
      <p>Data is used to authenticate the Shopify installation, synchronize permitted order information, import carrier-cost evidence, reconcile supported records, calculate historical policy scenarios, maintain merchant review history, produce exports, operate the service and respond to support or privacy requests.</p>
      <p>NODUS does not need a merchant's Shopify password. Do not send passwords, access tokens, payment card data or unrelated customer information through support channels.</p>
    </section>
    <section className="content-note">
      <h2>Service providers and access</h2>
      <p>The app uses Shopify for store authorization and permitted store data. Production hosting and database processing depend on the Vercel project and PostgreSQL provider selected by the responsible operator. Those providers process data to host and operate the service under their own terms. The operator must identify the actual database provider and complete the applicable processor and transfer disclosures before launch.</p>
      <p>Merchant records are scoped to the authenticated Shopify shop in application logic. This is not a claim of independent security certification or a completed penetration test.</p>
    </section>
    <section className="content-note">
      <h2>Retention, uninstall and deletion</h2>
      <p>On app uninstall, NODUS deletes the Shopify session records and marks the merchant installation as uninstalled. Merchant order, carrier-cost, review and value records are not deleted by the uninstall handler itself; the Shopify shop-redaction webhook deletes the merchant record and its related records. Customer-order redaction removes the corresponding stored order and associated cost references where they can be identified.</p>
      <p>Do not treat uninstall as immediate deletion of every stored record. The responsible operator must monitor privacy webhook delivery and handle requests through the published contact channel. The final retention period and any backup-expiry period must be set and disclosed by the operator before public launch.</p>
    </section>
    <section className="content-note">
      <h2>Security and limitations</h2>
      <p>NODUS uses Shopify authentication and merchant-scoped application records. It does not claim SOC 2, ISO 27001, PCI certification or an independent penetration test. Security controls also depend on the configured hosting and database providers. The public release must be reviewed for access isolation, secrets handling, backup restoration and incident response.</p>
      <p>See <Link to="/security">Security & trust</Link> for the current assurance boundary.</p>
    </section>
    <section className="content-note">
      <h2>Privacy contact</h2>
      {contactHref ? <a className="cta-primary" href={contactHref}>SEND A PRIVATE DATA REQUEST ↗</a> : <p className="import-error" role="status">A business-owned privacy contact is not configured. Public merchant onboarding must remain closed until one is set.</p>}
      <p>Before publishing this notice, the responsible business operator must add its legal identity, jurisdiction, effective date, database provider, final retention periods and any required regional disclosures, then obtain appropriate legal review.</p>
    </section>
  </main></MarketingShell>;
}
