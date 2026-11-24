import {useEffect,useMemo,useState} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"NODUS Control Week — a free seven-day shipping review"},
 {name:"description",content:"A practical seven-day shipping-cost review for Shopify merchants. Use sample data or analyze your own order and carrier CSV exports in your browser."},
 {property:"og:title",content:"NODUS Control Week — start free"},
 {property:"og:description",content:"See what customers paid for shipping, what carriers charged and what needs review."}
];

const tasks=[
 {date:"DAY 01",title:"See the gap",detail:"Run the sample review. Understand the difference between shipping collected, matched carrier cost and an unmatched charge.",href:"/demo",action:"OPEN THE SAMPLE REVIEW",deliverable:"A clear picture of what NODUS counts — and what it refuses to guess."},
 {date:"DAY 02",title:"Bring your own orders",detail:"Export Shopify orders with order ID, order name, currency, shipping revenue, tax treatment and tracking numbers. Import the CSV locally.",href:"/manual-data",action:"OPEN YOUR CSV REVIEW",deliverable:"Your order list, with shipping collected and tracking references."},
 {date:"DAY 03",title:"Add carrier costs",detail:"Import a carrier or 3PL cost CSV with invoice ID, charge ID, amount, currency and an order or tracking reference.",href:"/manual-data",action:"IMPORT COST RECORDS",deliverable:"Matched charges and a separate list of unmatched costs."},
 {date:"DAY 04",title:"Find the orders that need attention",detail:"Review orders with incomplete coverage, unmatched charges, duplicate references or carrier cost above shipping collected.",href:"/manual-data",action:"REVIEW THE EXCEPTIONS",deliverable:"An exception list based on the records you supplied."},
 {date:"DAY 05",title:"Test your shipping offer",detail:"If your export includes order subtotals, replay a flat shipping rate or free-shipping threshold against historical orders.",href:"/manual-data",action:"TEST A SHIPPING POLICY",deliverable:"A historical comparison with assumptions and limits shown."},
 {date:"DAY 06",title:"Make the review portable",detail:"Export the CSV register, JSON decision pack and readable report. Keep the evidence with your own finance or fulfilment records.",href:"/manual-data",action:"EXPORT YOUR REVIEW",deliverable:"A decision pack you can inspect without NODUS."},
 {date:"DAY 07",title:"Decide whether to repeat it",detail:"Review the recurring work: new invoices, changing carrier charges, unresolved exceptions and shipping-policy changes. Continue only if it solves a monthly problem.",href:"/pricing",action:"REVIEW THE MONTHLY PLAN",deliverable:"A clear go/no-go decision. No automatic charge at the end of the week."}
];

type Progress={startedAt:string;completed:number[]};
const KEY="nodus.control-week.v2";

export default function ControlWeek(){
 const [progress,setProgress]=useState<Progress|null>(null);
 const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const value=JSON.parse(raw) as Progress;if(typeof value.startedAt==="string"&&Array.isArray(value.completed))setProgress({startedAt:value.startedAt,completed:value.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<7)});}}catch{/* Corrupt local progress must not block the experience. */}setReady(true);},[]);
 const completed=new Set(progress?.completed??[]);
 const done=completed.size;
 const start=()=>{const next={startedAt:new Date().toISOString(),completed:[] as number[]};setProgress(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{/* The experience still works without saved progress. */}};
 const toggle=(index:number)=>{if(!progress)return;const next={...progress,completed:completed.has(index)?progress.completed.filter(n=>n!==index):[...progress.completed,index].sort((a,b)=>a-b)};setProgress(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{/* Progress remains available for this visit. */}};
 const started=progress?new Date(progress.startedAt):null;
 const endDate=useMemo(()=>started?new Date(started.getTime()+7*24*60*60*1000):null,[progress?.startedAt]);
 return <MarketingShell active="evaluation"><main className="content-page nd-control-week nd-control-week-live">
  <header><p className="page-eyebrow">NODUS / FREE SHIPPING CONTROL WEEK</p><h1>Seven days.<br/><em>Your shipping numbers.</em></h1><p className="page-lede">A hands-on review for Shopify stores that pay carriers or 3PLs to deliver orders. Start with a sample, then bring your own exports. The analysis runs in your browser. No card, store password or sales call is needed to begin.</p><div className="hero-ctas"><Link to="/demo" className="cta-primary">TRY THE SAMPLE NOW ↗</Link><Link to="/manual-data" className="cta-secondary">ANALYZE MY OWN CSV FILES ↗</Link></div></header>
  <section className="content-note cw-start">
   <div><span className="page-eyebrow">YOUR FREE WEEK</span><h2>{progress?"Your review is underway.":"Start when you are ready."}</h2><p>{progress?"Started "+started?.toLocaleDateString()+". Your seven-day window ends "+endDate?.toLocaleDateString()+". Progress is saved in this browser only.":"Press start to open a seven-day checklist. Your clock begins on this device; no account or payment details are required."}</p></div>
   <div className="cw-progress"><strong>{done}<small> / 7</small></strong><span>STEPS COMPLETED</span><div className="cw-progress-track"><i style={{width:(done/7*100)+"%"}}/></div></div>
   {ready?<button className="cta-primary" type="button" onClick={progress?()=>{try{localStorage.removeItem(KEY);}catch{}setProgress(null);}:start}>{progress?"RESET MY WEEK":"START MY FREE WEEK ↗"}</button>:<p>Loading your progress…</p>}
  </section>
  <section className="cw-days"><div className="cw-section-head"><span className="page-eyebrow">THE DAILY WORK</span><h2>Seven steps. Each one leaves you with something useful.</h2></div>
   {tasks.map((task,index)=><article className={completed.has(index)?"cw-day is-complete":"cw-day"} key={task.date}>
    <div className="cw-day-number">{task.date}<span>{completed.has(index)?"COMPLETED":"STEP "+String(index+1).padStart(2,"0")}</span></div>
    <div className="cw-day-copy"><h3>{task.title}</h3><p>{task.detail}</p><small>YOU LEAVE WITH: {task.deliverable}</small></div>
    <div className="cw-day-actions"><Link to={task.href}>{task.action} ↗</Link><label><input type="checkbox" checked={completed.has(index)} disabled={!progress} onChange={()=>toggle(index)}/><span>Mark complete</span></label></div>
   </article>)}
  </section>
  <section className="content-note cw-boundaries"><span className="page-eyebrow">WHAT THIS FREE WEEK ACTUALLY DOES</span><h2>Use the product. Keep your files.</h2><div className="content-grid">
   <article><span>PRIVATE BY DEFAULT</span><h2>Files stay in your browser</h2><p>The CSV review processes files locally. Source files are not uploaded to NODUS by this tool. The browser stores only the progress checklist and any review history you choose to save.</p></article>
   <article><span>NO FALSE SAVINGS CLAIMS</span><h2>Unknown stays unknown</h2><p>Missing cost evidence is not treated as zero. Unmatched charges stay separate. A negative shipping balance is not proof of a carrier error or money recovered.</p></article>
   <article><span>NO AUTOMATIC BILLING</span><h2>You choose what happens next</h2><p>The free experience does not convert into a paid plan automatically. Review the commercial scope before deciding whether a recurring service is useful.</p></article>
  </div></section>
  <section className="content-note cw-final"><h2>At the end of the week, one question matters.</h2><p>Did this review show you something you could not see easily before — and is it worth checking again next month?</p><div className="hero-ctas"><Link to="/pricing" className="cta-primary">SEE THE MONTHLY SERVICE ↗</Link><Link to="/support" className="cta-secondary">ASK A PRODUCT QUESTION ↗</Link></div></section>
 </main></MarketingShell>;
}
