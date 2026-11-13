import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, useActionData, useLoaderData } from "react-router";
import { authenticate } from "../shopify.server";
import { importCarrierCostCsv } from "../services/cost-import.server";

const pages: Record<string, { title: string; subtitle: string; heading: string; body: string }> = {
  orders: { title: "Order evidence", subtitle: "Order-level shipping revenue and fulfillment evidence.", heading: "Persistent order ingestion is not enabled", body: "The overview currently reads a bounded live Shopify sample. Durable, resumable order ingestion and source-level reconciliation remain outstanding." },
  evidence: { title: "Source evidence", subtitle: "Carrier invoices, labels and 3PL records.", heading: "Import carrier cost evidence", body: "Upload a carrier CSV with invoice_id, charge_id, amount and currency. Optional columns: order_reference, tracking_number, occurred_at and cost_type. Imported costs are stored against your authenticated shop; ambiguous matches are not auto-allocated." },
  diagnostics: { title: "Diagnostics", subtitle: "Evidence-backed causes, not unexplained alerts.", heading: "Diagnostics await reconciliation", body: "Findings will only be generated from validated source records, explicit coverage and versioned deterministic rules." },
  simulations: { title: "Policy simulations", subtitle: "Compare proposed policies against historical order scenarios.", heading: "Historical replay engine available", body: "Simulation compares shipping revenue for a supplied historical sample. It does not predict conversion, abandonment, order volume or profit." },
  policies: { title: "Policy control", subtitle: "Proposed changes, merchant approvals and verification.", heading: "Write access is disabled", body: "NODUS is read-only until each supported Shopify mutation, permission, baseline check and read-back verification has passed development-store tests. No shipping configuration has been changed." },
  monitoring: { title: "Continuous monitoring", subtitle: "Policy drift, new exceptions and post-change outcomes.", heading: "Monitoring is not active", body: "Scheduled jobs and durable event processing must be configured before NODUS can claim continuous monitoring." },
  reports: { title: "Reports", subtitle: "Traceable results, coverage and decision history.", heading: "No reports generated", body: "Reports will be available after the underlying evidence, reconciliation and review workflows are complete." }
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await authenticate.admin(request);
  const page = pages[params.section ?? ""];
  if (!page) throw new Response("Not found", { status: 404 });
  return page;
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { session } = await authenticate.admin(request);
  if (params.section !== "evidence") throw new Response("Not found", { status: 404 });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Choose a CSV file." };
  if (file.size < 1 || file.size > 5 * 1024 * 1024) return { ok: false, message: "CSV must be between 1 byte and 5 MB." };
  if (!file.name.toLowerCase().endsWith(".csv")) return { ok: false, message: "Only .csv files are accepted." };
  try {
    const result = await importCarrierCostCsv(session.shop, await file.text());
    return { ok: true, message: `Received ${result.received}; imported ${result.imported}; skipped ${result.duplicates} duplicate rows.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Import failed." };
  }
}

export default function Section() {
  const page = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  return <div className="page-wrap">
    <header className="topbar"><div><p className="eyebrow">NODUS / WORKSPACE</p><h1>{page.title}</h1><p className="muted">{page.subtitle}</p></div></header>
    <section className="surface-card">
      <h3>{page.heading}</h3><p className="body-copy">{page.body}</p>
      {page.title === "Source evidence" ? <Form method="post" encType="multipart/form-data" className="import-form">
        <label htmlFor="cost-file">Carrier cost CSV</label>
        <input id="cost-file" name="file" type="file" accept=".csv,text/csv" required />
        <button type="submit">Import evidence</button>
        {result ? <p role="status" className={result.ok ? "import-success" : "import-error"}>{result.message}</p> : null}
      </Form> : null}
    </section>
  </div>;
}
