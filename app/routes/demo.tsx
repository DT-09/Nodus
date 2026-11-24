import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { MarketingShell } from "../components/MarketingShell";

export const meta: MetaFunction = () => [
  { title: "3PL invoice audit example — contract vs billed charges | NODUS" },
  { name: "description", content: "Explore a synthetic 3PL invoice reconciliation. Compare warehouse charges with contract rates, activity evidence and unresolved exceptions." },
  { property: "og:title", content: "A 3PL invoice, checked against its contract" },
  { property: "og:description", content: "See how NODUS separates calculated rate variances, unsupported charges and verified outcomes." },
];

const findings = [
  { charge: "Pick & pack — first item", contract: "$2.50 / order", billed: "100 × $2.50 = $250.00", expected: "$250.00", difference: "$0.00", state: "Matches", note: "100 billed units match 100 activity records." },
  { charge: "Pallet storage", contract: "$0.80 / pallet-day", billed: "30 × $1.0667 = $32.00", expected: "$24.00", difference: "$8.00", state: "Rate variance", note: "Quantity is supported; billed unit rate differs from the example rate card." },
  { charge: "Monthly account fee", contract: "$99.00 fixed", billed: "$99.00", expected: "$99.00", difference: "$0.00", state: "Matches", note: "Fixed charge matches the effective contract rule." },
  { charge: "Peak season surcharge", contract: "No matching rule", billed: "$420.00", expected: "Not calculated", difference: "Unpriced", state: "Needs review", note: "No effective rate-card rule supports this charge. It is not automatically labelled an overcharge." },
];

const rateCard = [
  ["charge_code","unit","pricing","rate","currency","effective_from","effective_to"],
  ["PICK_FIRST","order","per_unit","2.50","USD","2026-01-01",""],
  ["PALLET_STORAGE","pallet_day","per_unit","0.80","USD","2026-01-01",""],
  ["ACCOUNT_FEE","month","fixed","99.00","USD","2026-01-01",""],
];
const invoice = [
  ["invoice_number","invoice_date","charge_code","quantity","unit","amount","currency","external_line_id"],
  ["INV-EXAMPLE-104","2026-11-01","PICK_FIRST","100","order","250.00","USD","L-001"],
  ["INV-EXAMPLE-104","2026-11-01","PALLET_STORAGE","30","pallet_day","32.00","USD","L-002"],
  ["INV-EXAMPLE-104","2026-11-01","ACCOUNT_FEE","1","month","99.00","USD","L-003"],
  ["INV-EXAMPLE-104","2026-11-01","PEAK_SURCHARGE","1","month","420.00","USD","L-004"],
];
const activity = [
  ["record_id","reference","charge_code","quantity","unit","occurred_at"],
  ...Array.from({ length: 100 }, (_, i) => [`PICK-${String(i + 1).padStart(3, "0")}`, `ORDER-${String(i + 1).padStart(3, "0")}`, "PICK_FIRST", "1", "order", "2026-10-31"]),
  ["STOR-001","PALLET-001","PALLET_STORAGE","30","pallet_day","2026-11-01"],
];

function downloadCsv(filename: string, data: string[][]) {
  const csv = data.map(row => row.map(value => '"' + value.replaceAll('"', '""') + '"').join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Demo() {
  return (
    <MarketingShell active="demo">
      <main className="content-page">
        <header>
          <p className="page-eyebrow">3PL BILLING CONTROL / SYNTHETIC EXAMPLE</p>
          <h1>What was agreed.<br /><em>What was billed.</em></h1>
          <p className="page-lede">A worked example of a warehouse invoice checked against an effective-dated rate card and operational activity. Every company, invoice and figure below is synthetic. This is a product demonstration, not a customer result.</p>
          <div className="hero-ctas">
            <Link to="/buyer-evaluation#trial-request" className="cta-primary">REQUEST A PRIVATE TRIAL ↗</Link>
            <Link to="/guides/3pl-invoice-reconciliation" className="cta-secondary">READ THE AUDIT CHECKLIST ↗</Link>
          </div>
        </header>

        <section className="content-note">
          <span className="page-eyebrow">SAMPLE PERIOD / NOVEMBER 2026 / USD</span>
          <h2>One invoice. Four charge lines. Three different conclusions.</h2>
          <p>NODUS does not collapse every difference into an overcharge. It separates supported rate variances from unpriced charges and lines that match the agreement.</p>
        </section>

        <section className="content-grid" aria-label="Synthetic 3PL invoice summary">
          <article><span>01 / INVOICE LINES</span><h2>4</h2><p>Charge lines in the synthetic invoice.</p></article>
          <article><span>02 / MATCHED</span><h2>2</h2><p>Lines that match the effective rate card.</p></article>
          <article><span>03 / RATE VARIANCE</span><h2>$8.00</h2><p>Calculated difference on a supported quantity.</p></article>
          <article><span>04 / UNPRICED</span><h2>$420.00</h2><p>Charge with no matching contract rule; not classified as recoverable.</p></article>
        </section>

        <section className="content-note">
          <h2>Line-by-line reconciliation</h2>
          <div className="demo-table-wrap">
            <table className="demo-table">
              <thead><tr><th>Invoice charge</th><th>Contract rule</th><th>Billed</th><th>Expected</th><th>Difference</th><th>Evidence state</th></tr></thead>
              <tbody>{findings.map(row => <tr key={row.charge}>
                <th scope="row">{row.charge}<small>{row.note}</small></th>
                <td>{row.contract}</td><td>{row.billed}</td><td>{row.expected}</td><td>{row.difference}</td>
                <td><span className={row.state === "Matches" ? "demo-state" : "demo-state demo-state-warning"}>{row.state}</span></td>
              </tr>)}</tbody>
            </table>
          </div>
          <p className="pricing-footnote">The $8.00 is a calculated rate difference in this synthetic example. It is not proof of provider liability, a valid dispute or a posted credit. The $420.00 unpriced charge requires contract review before any conclusion.</p>
        </section>

        <section className="content-note">
          <h2>How the evidence is connected</h2>
          <div className="content-grid">
            <article><span>01 / AGREEMENT</span><h2>Effective rate card</h2><p>Pick fee: $2.50 per order. Pallet storage: $0.80 per pallet-day. Monthly account fee: $99 fixed.</p></article>
            <article><span>02 / INVOICE</span><h2>Provider charges</h2><p>Each invoice line retains its original charge code, quantity, unit, amount, currency and source-line reference.</p></article>
            <article><span>03 / ACTIVITY</span><h2>Operational support</h2><p>100 pick records support 100 billed orders. The storage quantity is present in the sample activity export. The rate comparison remains a separate check.</p></article>
          </div>
        </section>

        <section className="content-note">
          <h2>Run the sample through your own workflow</h2>
          <p>Download the three synthetic CSVs. Import the rate card first, then the invoice, then the activity file into a NODUS evaluation workspace. Confirm the rate card against the signed agreement before using real data.</p>
          <div className="hero-ctas">
            <button type="button" className="cta-primary" onClick={() => downloadCsv("nodus-sample-3pl-rate-card.csv", rateCard)}>DOWNLOAD RATE CARD ↧</button>
            <button type="button" className="cta-secondary" onClick={() => downloadCsv("nodus-sample-3pl-invoice.csv", invoice)}>DOWNLOAD INVOICE ↧</button>
            <button type="button" className="cta-secondary" onClick={() => downloadCsv("nodus-sample-3pl-activity.csv", activity)}>DOWNLOAD ACTIVITY ↧</button>
          </div>
          <p className="pricing-footnote">All records are synthetic. No real merchant, warehouse, provider or recovery is represented.</p>
        </section>

        <section className="content-note">
          <h2>What NODUS does not claim</h2>
          <p>A rate variance is not confirmed overbilling. An unpriced charge is not automatically invalid. A promised credit is not a posted credit. NODUS records the evidence and status; the merchant decides whether to raise a query with the provider.</p>
          <Link to="/buyer-evaluation#trial-request" className="cta-primary">CHECK YOUR 3PL DATA ↗</Link>
        </section>
      </main>
    </MarketingShell>
  );
}
