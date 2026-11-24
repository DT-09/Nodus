import {useEffect,useMemo,useState} from "react";
import type {MetaFunction} from "react-router";
import {Link} from "react-router";
import {MarketingShell} from "../components/MarketingShell";

export const meta:MetaFunction=()=>[
 {title:"Free 7-day shipping control week — NODUS"},
 {name:"description",content:"A hands-on seven-day shipping cost review for Shopify merchants. Start with sample records, analyze your own exports, review exceptions and test shipping policies."}
];
const days=[
 {n:"01",name:"See the gap",tag:"SAMPLE REVIEW",summary:"Run the sample ledger. See how $26 in shipping collected compares with supported carrier charges — and why the unmatched line stays separate.",href:"/demo",action:"Open the sample ledger",output:"A first exception: one carrier charge with no supported order match.",proof:"Sample review inspected"},
 {n:"02",name:"Bring your orders",tag:"YOUR SHOPIFY EXPORT",summary:"Export a representative order CSV and load it into the browser review. No store connection or password.",href:"/manual-data",action:"Import order data",output:"An order register with shipping collected, currency and tracking references.",proof:"Order file reviewed"},
 {n:"03",name:"Add the carrier bill",tag:"CARRIER / 3PL COSTS",summary:"Load the invoice or 3PL cost export. Match exact order references and unique tracking numbers.",href:"/manual-data",action:"Import carrier costs",output:"Supported matches, unmatched charges and incomplete coverage kept apart.",proof:"Carrier costs reviewed"},
 {n:"04",name:"Open the exceptions",tag:"WHERE TO LOOK",summary:"Find orders where the supported shipping balance is negative, records are incomplete or a cost cannot be assigned safely.",href:"/manual-data",action:"Review the exception list",output:"A short list of records that deserve a human check.",proof:"Exceptions inspected"},
 {n:"05",name:"Test the shipping offer",tag:"POLICY REPLAY",summary:"If your order export includes subtotals, compare a flat shipping rate or free-shipping threshold against historical orders.",href:"/manual-data",action:"Open policy replay",output:"A historical comparison with its assumptions and limits.",proof:"Policy test completed"},
 {n:"06",name:"Take the evidence with you",tag:"REVIEW PACK",summary:"Export the register, JSON decision pack and readable report. Keep the rows behind the result.",href:"/manual-data",action:"Export the review pack",output:"Files your finance or operations team can inspect independently.",proof:"Review pack exported"},
 {n:"07",name:"Decide if it earns a repeat",tag:"MONTHLY CONTROL",summary:"Review how often new carrier charges arrive, how many exceptions remain open and whether the monthly review saves enough manual work to justify a paid service.",href:"/pricing",action:"Review the monthly plan",output:"A go / no-go decision. The free week does not auto-convert to paid.",proof:"Monthly fit assessed"}
];
type Progress={startedAt:string;completed:number[]};
const KEY="nodus.control-week.v3";
export default function ControlWeek(){
 const [progress,setProgress]=useState<Progress|null>(null);
 const [selected,setSelected]=useState(0);
 const [ready,setReady]=useState(false);
 useEffect(()=>{try{const raw=localStorage.getItem(KEY);if(raw){const v=JSON.parse(raw) as Progress;if(typeof v.startedAt==="string"&&Array.isArray(v.completed))setProgress({startedAt:v.startedAt,completed:v.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<7)});}}catch{}setReady(true);},[]);
 const completed=new Set(progress?.completed??[]);
 const done=completed.size;
 const start=()=>{const p={startedAt:new Date().toISOString(),completed:[] as number[]};setProgress(p);setSelected(0);try{localStorage.setItem(KEY,JSON.stringify(p));}catch{}};
 const toggle=(i:number)=>{if(!progress)return;const next={...progress,completed:completed.has(i)?progress.completed.filter(x=>x!==i):[...progress.completed,i].sort((a,b)=>a-b)};setProgress(next);try{localStorage.setItem(KEY,JSON.stringify(next));}catch{}};
 const started=progress?new Date(progress.startedAt):null;
 const end=useMemo(()=>started?new Date(started.getTime()+7*86400000):null,[progress?.startedAt]);
 const current=days[selected]!;
 return <MarketingShell active="week"><main className="nd-week-page">
  <section className="nd-week-hero"><div><span className="nd-overline">NODUS / MERCHANT CONTROL WEEK</span><h1>Seven days with<br/><em>your shipping data.</em></h1><p>Not a demo call. Not a slide deck. A guided review using sample records first, then your own Shopify and carrier exports.</p><div className="nd-week-hero-meta"><span>FREE FOR 7 DAYS</span><i/> <span>NO CARD</span><i/> <span>FILES STAY LOCAL</span></div></div><div className="nd-week-clock"><div className="nd-clock-ring"><div><b>7</b><span>DAYS</span></div></div><small>ONE WEEK. YOUR OWN NUMBERS.</small></div></section>
  <section className="nd-week-console">
   <div className="nd-week-console-head"><div><span className="nd-overline">YOUR CONTROL ROOM</span><h2>{progress?"Your review is in progress.":"Start with the sample. Finish with a decision."}</h2><p>{progress?"Started "+started?.toLocaleDateString()+" · Ends "+end?.toLocaleDateString()+" · Progress stays in this browser.":"Start the week to save progress on this device. You can inspect the sample before starting."}</p></div><div className="nd-week-progress"><strong>{done}<small> / 7</small></strong><span>STEPS COMPLETE</span><div><i style={{width:(done/7*100)+"%"}}/></div></div></div>
   <div className="nd-week-actions">{ready&&!progress?<button className="nd-button nd-button-primary" onClick={start}>Start my free week ↗</button>:progress?<button className="nd-button nd-button-quiet" onClick={()=>{try{localStorage.removeItem(KEY)}catch{}setProgress(null);setSelected(0)}}>Reset progress</button>:<span>Loading saved progress…</span>}<Link to="/demo" className="nd-text-link">Preview sample first ↗</Link></div>
  </section>
  <section className="nd-day-explorer"><div className="nd-day-list"><div className="nd-day-list-head"><span className="nd-overline">THE SEVEN-DAY RUN</span><span>{done} / 7 DONE</span></div>{days.map((d,i)=><button key={d.n} className={"nd-day-item"+(selected===i?" is-active":"")+(completed.has(i)?" is-done":"")} onClick={()=>setSelected(i)}><span className="nd-day-no">{d.n}</span><span className="nd-day-name">{d.name}<small>{d.tag}</small></span><span className="nd-day-mark">{completed.has(i)?"✓":selected===i?"—":"+"}</span></button>)}</div>
   <article className="nd-day-detail"><div className="nd-day-detail-top"><span>DAY {current.n} / 07</span><span>{current.tag}</span></div><div className="nd-day-detail-art"><div className="nd-detail-orbit"/><div className="nd-detail-orbit nd-detail-orbit-two"/><div className="nd-detail-core"><span>{current.n}</span><small>NODUS</small></div><div className="nd-detail-lines"><i/><i/><i/><i/></div></div><h2>{current.name}</h2><p>{current.summary}</p><div className="nd-day-output"><span>WHAT YOU LEAVE WITH</span><b>{current.output}</b></div><div className="nd-day-detail-actions"><Link to={current.href} className="nd-button nd-button-primary">{current.action} ↗</Link>{progress?<label className="nd-complete-check"><input type="checkbox" checked={completed.has(selected)} onChange={()=>toggle(selected)}/><span>Mark this step complete</span></label>:<span className="nd-unlocked-note">Start the week to track progress</span>}</div></article>
  </section>
  <section className="nd-week-truth"><div><span className="nd-overline">THE RULES</span><h2>Useful numbers.<br/><em>Honest boundaries.</em></h2></div><div className="nd-truth-grid"><article><b>01</b><h3>Private by default</h3><p>The public CSV review processes selected files in your browser. Source files are not uploaded to NODUS by this workflow.</p></article><article><b>02</b><h3>No invented recovery</h3><p>A negative shipping balance is a review signal, not proof of carrier liability or money recovered.</p></article><article><b>03</b><h3>No surprise charge</h3><p>The week does not auto-convert to paid. Review the proposed monthly service and decide for yourself.</p></article></div></section>
  <section className="nd-week-close"><span className="nd-overline">AFTER DAY SEVEN</span><h2>If the monthly review does not save time or surface useful exceptions, <em>do not pay for it.</em></h2><Link to="/pricing" className="nd-text-link">See the proposed monthly service ↗</Link></section>
 </main></MarketingShell>;
}
