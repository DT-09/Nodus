import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS architecture — Business operating intelligence"},
 {name:"description",content:"Explore the NODUS operating model: connected business state, analytical and diagnostic engines, strategic planning, controlled execution and outcome verification."}
];

const engines=[
 ["01","Business state","A versioned, connected model of products, orders, customers, finance, operations, suppliers, objectives and outcomes."],
 ["02","Data intelligence","Ingestion, normalization, identity resolution, validation, provenance, freshness and explicit data-quality boundaries."],
 ["03","Analytical intelligence","Deterministic financial calculations, cohorts, trends, anomalies, forecasts, scenarios and constrained optimization."],
 ["04","Diagnosis","Evidence-backed hypotheses, tests, ranked causes and uncertainty. Correlation is never silently promoted to causation."],
 ["05","Opportunity & strategy","Prioritized opportunities with impact, confidence, feasibility, resources, risk, dependencies and measurable targets."],
 ["06","Planning & execution","Durable work plans, dependency-aware jobs, policy checks, approval gates, idempotent actions and safe recovery."],
 ["07","Verification & learning","External-state read-back, expected-versus-actual outcomes, recorded interventions and evaluated adaptation."]
];
const autonomy=[
 ["OBSERVE","Automatic","Read connected data, monitor state and calculate supported metrics."],
 ["DIAGNOSE","Automatic","Surface evidence-backed findings, uncertainty and possible causes."],
 ["PREPARE","Automatic","Draft plans, content, workflows and proposed changes for review."],
 ["LOW-RISK ACTION","Pre-authorised","Run only reversible actions explicitly permitted by merchant policy."],
 ["CONSEQUENTIAL CHANGE","Approval required","Publishing, pricing, customer communication, refunds, purchases and budget changes."],
 ["HIGH-IMPACT COMMITMENT","Human authority","Financial, legal, tax and binding business commitments remain human decisions."]
];
export default function Product(){
 return <MarketingShell active="product"><main className="content-page nd-architecture">
  <header><p className="page-eyebrow">NODUS / SYSTEM ARCHITECTURE</p><h1>Your store’s operating system.<br/><em>Not another dashboard.</em></h1><p className="page-lede">NODUS is designed to help Shopify merchants run the whole business: understand performance, diagnose problems, prioritize opportunities, build a practical roadmap, coordinate work and verify results. The architecture connects specialist capabilities across finance, sales, marketing, customers, products, supply chain and operations. These are the product vision and staged roadmap—not a claim that every integration is live today.</p></header>
  <section className="content-note nd-architecture-principle"><span>THE CENTRAL OPERATING LOOP</span><h2>SENSE → UNDERSTAND → INVESTIGATE → STRATEGIZE → EXECUTE → VERIFY → LEARN</h2><p>Every objective should move through a traceable lifecycle. A recommendation is not an execution. An API response is not proof of an outcome. NODUS must verify the resulting business state.</p></section>
  <section className="nd-architecture-engines"><div className="nd-architecture-heading"><span>01 / SHARED INTELLIGENCE</span><h2>Seven cooperating engines.<br/><em>One coherent business model.</em></h2></div><div className="nd-engine-grid">{engines.map(([n,title,body])=><article key={n}><span>{n} / ENGINE</span><h3>{title}</h3><p>{body}</p></article>)}</div></section>
  <section className="nd-architecture-domains"><div className="nd-architecture-heading"><span>02 / BUSINESS COVERAGE</span><h2>One operating picture<br/><em>across the company.</em></h2></div><div className="nd-architecture-domain-grid">{["Finance & profitability","Sales & revenue","Marketing & growth","Customers & CRM","Products & inventory","Supply chain & logistics","Operations & workflows","Strategy & development","Risk & governance","Business administration","Executive intelligence"].map((name,i)=><div key={name}><b>{String(i+1).padStart(2,"0")}</b><span>{name}</span></div>)}</div><p className="nd-architecture-note">These are architectural domains, not a claim that every connector or autonomous action is currently available. The first commercial wedge is Shopify shipping economics.</p></section>
  <section className="nd-architecture-control"><div className="nd-architecture-heading"><span>03 / AUTONOMY & AUTHORITY</span><h2>Autonomous where safe.<br/><em>Human-controlled where it matters.</em></h2><p>Agents do not receive unrestricted database or platform access. Every external write passes through policy enforcement, an auditable action record and outcome verification.</p></div><div className="nd-autonomy-list">{autonomy.map(([level,authority,desc])=><article key={level}><span>{level}</span><b>{authority}</b><p>{desc}</p></article>)}</div></section>
  <section className="nd-architecture-current"><div><span>04 / RELEASE REALITY</span><h2>What is implemented<br/><em>and what remains.</em></h2><p>The codebase now includes a Shopify OAuth flow, encrypted offline-token storage, expiring merchant sessions, read-only order synchronization, persistent carrier-cost imports, exact-reference reconciliation, signed webhook handling and a merchant workspace. These capabilities still require production Partner credentials and end-to-end Shopify installation testing. The browser-local CSV workflow remains available independently.</p><Link to="/shipping-cost-reconciliation">CURRENT PRODUCT WORKFLOW ↗</Link></div><div><h3>Not yet verified as production capabilities</h3><ul><li>Production Shopify Partner credentials and merchant onboarding</li><li>General-purpose cross-business data graph</li><li>Finance, marketing, CRM and inventory integrations</li><li>Multi-agent diagnosis and strategic orchestration</li><li>Recurring sync, billing, and autonomous execution</li><li>Durable autonomous execution across external platforms</li><li>Recurring subscription lifecycle and public app approval</li><li>Production tenant, security and operational acceptance across real merchants</li></ul></div></section>
  <section className="content-note"><h2>Evaluate the current product</h2><p>Start with a no-fee founding assessment request. The form collects business contact and qualification details only; it does not collect order files or authorize Shopify. The manual CSV workflow stays in the browser.</p><div className="hero-ctas"><Link to="/pricing" className="cta-primary">REQUEST A FOUNDING ASSESSMENT ↗</Link><Link to="/demo" className="cta-secondary">INSPECT THE SAMPLE PACK ↗</Link><Link to="/install" className="cta-secondary">INSTALL THE APP ↗</Link></div></section>
 </main></MarketingShell>;
}
