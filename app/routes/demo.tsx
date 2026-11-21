import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { MarketingShell } from "../components/MarketingShell";

export const meta: MetaFunction = () => [
  { title: "Sample reconciliation — NODUS" },
  { name: "description", content: "Inspect an illustrative, synthetic shipping-cost reconciliation and see how NODUS separates matched, unmatched and incomplete evidence." },
];

const rows = [
  { order: "#1042", shipping: "$8.00", cost: "$7.20", variance: "+$0.80", state: "Matched", note: "Exact order reference" },
  { order: "#1043", shipping: "$6.00", cost: "$9.40", variance: "−$3.40", state: "Matched", note: "Unambiguous tracking number" },
  { order: "#1044", shipping: "$0.00", cost: "—", variance: "Excluded", state: "Incomplete", note: "No carrier-cost evidence imported" },
  { order: "#1045", shipping: "$12.00", cost: "$10.30", variance: "+$1.70", state: "Matched", note: "Two supported charge records" },
  { order: "Invoice #C-77", shipping: "—", cost: "$14.60", variance: "Excluded", state: "Unmatched", note: "No unique order reference" },

];

const sampleOrders = [
  ["order_id","order_name","currency","shipping_revenue","taxes_included","tracking_numbers"],
  ["1042","#1042","USD","8.00","false","1Z999AA10123456784"],
  ["1043","#1043","USD","6.00","false","1Z999AA10123456785"],
  ["1044","#1044","USD","0.00","false",""],
  ["1045","#1045","USD","12.00","false","1Z999AA10123456786"],
];
const sampleCosts = [
  ["invoice_id","charge_id","amount","currency","order_reference","tracking_number"],
  ["C-77","C-001","7.20","USD","#1042",""],
  ["C-77","C-002","9.40","USD","","1Z999AA10123456785"],
  ["C-77","C-003","4.80","USD","#1045",""],
  ["C-77","C-004","5.50","USD","#1045",""],
  ["C-77","C-005","14.60","USD","#9999",""],
];

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(row => row.map(value => '"' + value.replaceAll('"','""') + '"').join(",")).join("\r\n");
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
          <p className="page-eyebrow">PRODUCT WALKTHROUGH / SYNTHETIC DATA</p>
          <h1>Inspect the evidence.<br /><em>Then inspect the conclusion.</em></h1>
          <p className="page-lede">
            This is a deliberately small, illustrative dataset. It demonstrates the evidence
            states and arithmetic NODUS is designed to expose; it is not a merchant result,
            customer case study or screenshot from a live store.
          </p>
        </header>

        <section className="content-note">
          <span className="page-eyebrow">SAMPLE RUN / USD / FOUR ORDERS</span>
          <h2>One incomplete record changes what can be claimed.</h2>
          <p>
            Three orders have supported cost evidence. One does not. NODUS must keep the
            incomplete order out of complete-coverage calculations rather than treating its
            missing carrier cost as zero.
          </p>
        </section>

        <section className="content-grid" aria-label="Synthetic reconciliation summary">
          <article><span>01 / ORDER SAMPLE</span><h2>4</h2><p>Synthetic Shopify orders in this example.</p></article>
          <article><span>02 / MATCHED</span><h2>3</h2><p>Orders with supported carrier-cost evidence.</p></article>
          <article><span>03 / INCOMPLETE</span><h2>1</h2><p>Order excluded from complete-coverage arithmetic.</p></article>
          <article><span>04 / UNMATCHED</span><h2>1 line</h2><p>Separate imported charge awaiting merchant review.</p></article>
        </section>

        <section className="content-note">
          <h2>Order-level evidence register</h2>
          <div className="demo-table-wrap">
            <table className="demo-table">
              <thead><tr><th>Order / source</th><th>Shipping collected</th><th>Carrier cost</th><th>Variance*</th><th>Evidence state</th></tr></thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.order}>
                    <th scope="row">{row.order}</th>
                    <td>{row.shipping}</td>
                    <td>{row.cost}</td>
                    <td>{row.variance}</td>
                    <td><span className={row.state === "Matched" ? "demo-state" : "demo-state demo-state-warning"}>{row.state}</span><small>{row.note}</small></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="pricing-footnote">* Illustrative shipping collected minus imported carrier charges, before any other fulfillment costs, tax treatment or overhead. Positive variance is not profit or recovered value.</p>
        </section>

        <section className="content-note">
          <h2>What this example does not claim</h2>
          <p>No carrier credit has been issued. No recovery is confirmed. No conversion or profit forecast is calculated. A matched cost record does not prove that every parcel-level expense has been captured.</p>
          <p>The separate unmatched charge remains outside the order totals until a merchant can support its assignment.</p>
        </section>

        <section className="content-note">
          <h2>Run this exact example yourself</h2>
          <p>Download the two synthetic CSV files below, open the shipping review tool, and import them. The files reproduce the example above: three orders with supported cost evidence, one order without cost evidence, and one unmatched carrier charge. They contain no merchant data.</p>
          <div className="hero-ctas">
            <button type="button" className="cta-primary" onClick={() => downloadCsv("nodus-sample-orders.csv", sampleOrders)}>DOWNLOAD SAMPLE ORDERS ↧</button>
            <button type="button" className="cta-secondary" onClick={() => downloadCsv("nodus-sample-carrier-costs.csv", sampleCosts)}>DOWNLOAD SAMPLE CARRIER COSTS ↧</button>
            <Link to="/manual-data" className="cta-secondary">OPEN THE CSV REVIEW ↗</Link>
          </div>
          <p className="pricing-footnote">Synthetic training data only. The sample demonstrates matching and exception handling; it is not a customer result or evidence of savings.</p>
        </section>
        <section className="content-note">
          <h2>Evaluate your own evidence</h2>
          <p>When the sample behaves as expected, try an authorized store export and a representative carrier invoice export. Both files are processed locally in your browser. The first evaluation establishes whether your data can be reconciled, where coverage is incomplete and which results deserve review.</p>
          <Link to="/buyer-evaluation">REQUEST A NO-FEE EVALUATION ↗</Link>
        </section>
      </main>
    </MarketingShell>
  );
}
