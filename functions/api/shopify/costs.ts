import { json, merchantSession, type PagesContext } from "../../_lib/shopify";
function parseCsv(source:string):string[][]{
 const rows:string[][]=[];let row:string[]=[],field="",quoted=false;
 for(let i=0;i<source.length;i++){const c=source[i]!;
  if(quoted){if(c==='"'&&source[i+1]==='"'){field+='"';i++;}else if(c==='"'){quoted=false;}else field+=c;continue;}
  if(c==='"'&&field.length===0){quoted=true;continue;}
  if(c===","){row.push(field);field="";continue;}
  if(c==="\n"){row.push(field);rows.push(row);row=[];field="";continue;}
  if(c!=="\r")field+=c;
 }
 if(quoted)throw new Error("The CSV contains an unclosed quoted field.");
 if(field.length||row.length){row.push(field);rows.push(row);}
 return rows.filter(r=>r.some(v=>v.trim().length));
}
const clean=(v:string,max=300)=>v.trim().slice(0,max);
export async function onRequestPost({request,env}:PagesContext){
 const origin=request.headers.get("Origin");if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return json({error:"Origin rejected."},403);}catch{return json({error:"Origin rejected."},403);}}
 const merchant=await merchantSession(request,env);if(!merchant)return json({error:"Connect a Shopify store first."},401);
 const type=request.headers.get("Content-Type")||"";if(!type.toLowerCase().includes("text/csv")&&!type.toLowerCase().includes("text/plain"))return json({error:"Send a CSV file as text/csv."},415);
 const raw=await request.text();if(raw.length>1_000_000)return json({error:"CSV exceeds the 1 MB import limit."},413);
 let rows:string[][];try{rows=parseCsv(raw);}catch(e){return json({error:e instanceof Error?e.message:"Invalid CSV."},400);}
 if(rows.length<2)return json({error:"The CSV must contain a header and at least one charge row."},400);
 const headers=rows[0]!.map(x=>clean(x,80).toLowerCase().replaceAll(" ","_"));
 const index=(name:string)=>headers.indexOf(name);
 const required=["invoice_id","charge_id","amount","currency"];
 const missing=required.filter(x=>index(x)<0);if(missing.length)return json({error:"Missing required columns: "+missing.join(", ")},400);
 if(rows.length>5001)return json({error:"The import is limited to 5,000 charge rows per file."},413);
 const get=(row:string[],name:string)=>index(name)<0?"":clean(row[index(name)]||"",300);
 const prepared:Array<{id:string;invoice:string;amount:string;currency:string;order:string;tracking:string;kind:string;date:string|null}>=[];
 const seen=new Set<string>();
 for(let n=1;n<rows.length;n++){
  const row=rows[n]!;const id=get(row,"charge_id"),invoice=get(row,"invoice_id"),amount=get(row,"amount"),currency=get(row,"currency").toUpperCase();
  if(!id||!invoice||!/^[-+]?\d+(?:\.\d{1,4})?$/.test(amount)||!/^[A-Z]{3}$/.test(currency))return json({error:`Invalid required value on CSV row ${n+1}. Check invoice_id, charge_id, amount and ISO currency.`},400);
  if(seen.has(id))return json({error:`Duplicate charge_id "${id}" in the uploaded file (row ${n+1}).`},400);seen.add(id);
  const date=get(row,"occurred_at");if(date&&Number.isNaN(Date.parse(date)))return json({error:`Invalid occurred_at date on CSV row ${n+1}.`},400);
  prepared.push({id,invoice,amount,currency,order:get(row,"order_reference"),tracking:get(row,"tracking_number"),kind:get(row,"cost_type")||"carrier",date:date||null});
 }
 const importedAt=new Date().toISOString();let inserted=0;
 for(let offset=0;offset<prepared.length;offset+=100){
  const chunk=prepared.slice(offset,offset+100);
  const statements=chunk.map(x=>env.NODUS_DB.prepare("INSERT INTO shopify_costs(shop,source_system,source_record_id,invoice_id,order_reference,tracking_number,currency,amount,cost_type,occurred_at,imported_at) VALUES(?,'carrier_csv',?,?,?,?,?,?,?,?,?) ON CONFLICT(shop,source_system,source_record_id) DO UPDATE SET invoice_id=excluded.invoice_id,order_reference=excluded.order_reference,tracking_number=excluded.tracking_number,currency=excluded.currency,amount=excluded.amount,cost_type=excluded.cost_type,occurred_at=excluded.occurred_at,imported_at=excluded.imported_at").bind(merchant.shop,x.id,x.invoice,x.order||null,x.tracking||null,x.currency,x.amount,x.kind,x.date,importedAt));
  await env.NODUS_DB.batch(statements);inserted+=chunk.length;
 }
 return json({ok:true,rows:prepared.length,imported:inserted,message:"Carrier cost records are stored in this Shopify merchant workspace. Matching remains limited to explicit references and currency."},201);
}
