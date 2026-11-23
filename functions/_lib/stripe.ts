export interface StripeCheckoutInput { secret:string; appUrl:string; leadId:string; email:string; offer:"paid_audit"|"monthly_review"; }
export async function createStripeCheckout(input:StripeCheckoutInput){
 const recurring=input.offer==="monthly_review";
 const form=new URLSearchParams();
 form.set("mode",recurring?"subscription":"payment");
 form.set("client_reference_id",input.leadId);
 form.set("customer_email",input.email);
 form.set("billing_address_collection","required");
 form.set("allow_promotion_codes","true");
 form.set("line_items[0][quantity]","1");
 form.set("line_items[0][price_data][currency]","usd");
 form.set("line_items[0][price_data][unit_amount]",recurring?"9900":"14900");
 form.set("line_items[0][price_data][product_data][name]",recurring?"NODUS Monthly Shipping Review":"NODUS Shipping Cost Audit");
 form.set("line_items[0][price_data][product_data][description]",recurring?"One monthly analyst-delivered shipping economics review for one Shopify store, under the agreed scope.":"One analyst-delivered shipping cost baseline audit for one Shopify store, under the agreed scope.");
 if(recurring)form.set("line_items[0][price_data][recurring][interval]","month");
 form.set("metadata[lead_id]",input.leadId);
 form.set("metadata[offer_type]",input.offer);
 if(recurring)form.set("subscription_data[metadata][lead_id]",input.leadId);
 form.set("success_url",new URL("/buyer-evaluation?checkout=success&session_id={CHECKOUT_SESSION_ID}",input.appUrl).toString());
 form.set("cancel_url",new URL("/pricing?checkout=cancelled",input.appUrl).toString());
 const response=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:"Bearer "+input.secret,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":"nodus-checkout-"+input.leadId},body:form});
 const result=await response.json() as {id?:string;url?:string;error?:{message?:string}};
 if(!response.ok||!result.id||!result.url)throw new Error(result.error?.message||"Payment provider did not create a checkout session.");
 return {id:result.id,url:result.url};
}
export async function verifyStripeSignature(raw:string,header:string,secret:string){
 const parts=header.split(",").map(part=>part.trim().split("=",2));
 const timestamp=parts.find(([key])=>key==="t")?.[1]||"";
 const signatures=parts.filter(([key])=>key==="v1").map(([,value])=>value||"");
 if(!/^\d+$/.test(timestamp)||!signatures.length||Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
 const signed=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(timestamp+"."+raw));
 const expected=[...new Uint8Array(signed)].map(value=>value.toString(16).padStart(2,"0")).join("");
 return signatures.some(signature=>{if(signature.length!==expected.length)return false;let mismatch=0;for(let i=0;i<expected.length;i++)mismatch|=expected.charCodeAt(i)^signature.charCodeAt(i);return mismatch===0;});
}

export async function scheduleWorkspaceSubscriptionCancellation(input: { secret: string; subscriptionId: string; idempotencyKey: string }) {
  const form = new URLSearchParams();
  form.set("cancel_at_period_end", "true");
  const response = await fetch("https://api.stripe.com/v1/subscriptions/" + encodeURIComponent(input.subscriptionId), {
    method: "POST",
    headers: {
      Authorization: "Bearer " + input.secret,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": input.idempotencyKey,
    },
    body: form,
  });
  const result = await response.json() as { id?: string; status?: string; cancel_at_period_end?: boolean; current_period_end?: number; error?: { message?: string } };
  if (!response.ok || !result.id || result.cancel_at_period_end !== true || !result.current_period_end) throw new Error(result.error?.message || "Stripe did not schedule subscription cancellation.");
  return { id: result.id, periodEnd: new Date(result.current_period_end * 1000).toISOString(), status: result.status || "active" };
}
