import {describe,it,expect} from "vitest";
import {parseMoney,addMoney,formatMoney} from "./money";
import {reconcileShipping} from "./reconcile";
import {diagnoseReconciliation} from "./diagnostics";
import {simulateHistoricalShippingRevenue} from "./simulation";
import {approve,beginExecution,verify} from "./policy-workflow";
import {parseCarrierCostCsv} from "./carrier-csv";

describe("NODUS deterministic domain",()=>{
  it("uses integer minor units",()=>{const m=parseMoney("125.40","USD");expect(m.minor).toBe(12540n);expect(formatMoney(m)).toBe("USD 125.40")});
  it("supports zero- and three-decimal currencies",()=>{expect(parseMoney("125","JPY").minor).toBe(125n);expect(parseMoney("1.234","KWD").minor).toBe(1234n)});
  it("rejects excess precision and currency mismatch",()=>{expect(()=>parseMoney("1.001","USD")).toThrow();expect(()=>addMoney(parseMoney("1","USD"),parseMoney("1","EUR"))).toThrow()});
  it("flags under-recovery only with complete evidence",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"complete"}],[{evidenceId:"e1",orderReference:"o1",amount:parseMoney("7","USD")}]);expect(diagnoseReconciliation(rows)[0]?.ruleId).toBe("shipping.under_recovery_evidenced.v1")});
  it("allows a zero-cost result only after explicit complete coverage review",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"complete"}],[]);expect(rows[0]?.coverage).toBe("complete");expect(rows[0]?.evidencedCost?.minor).toBe(0n);expect(rows[0]?.shippingContributionBeforeUnobservedCosts?.minor).toBe(500n)});
  it("does not treat mismatched-currency evidence as complete coverage",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"complete"}],[{evidenceId:"e1",orderReference:"o1",amount:parseMoney("7","EUR")}]);expect(rows[0]?.coverage).toBe("partial");expect(rows[0]?.shippingContributionBeforeUnobservedCosts).toBeNull()});
  it("does not fall back to tracking when an explicit order reference fails to match",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:["T1"],costCoverage:"partial"}],[{evidenceId:"e1",orderReference:"#wrong",trackingNumber:"T1",amount:parseMoney("2","USD")}]);expect(rows[0]?.evidenceIds).toEqual([])});
  it("preserves an explicit partial coverage review when no cost rows match",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"partial"}],[]);expect(rows[0]?.coverage).toBe("partial");expect(diagnoseReconciliation(rows)[0]?.ruleId).toBe("shipping.cost_coverage_partial.v1")});
  it("withholds contribution for tax-inclusive Shopify shipping charges",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"complete",taxesIncluded:true}],[]);expect(rows[0]?.coverage).toBe("complete");expect(rows[0]?.taxesIncluded).toBe(true);expect(rows[0]?.shippingContributionBeforeUnobservedCosts).toBeNull();expect(diagnoseReconciliation(rows).some((finding)=>finding.ruleId==="shipping.tax_inclusive_charge.v1")).toBe(true)});
  it("does not calculate from partial evidence",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"partial"}],[{evidenceId:"e1",orderReference:"o1",amount:parseMoney("2","USD")}]);expect(rows[0]?.shippingContributionBeforeUnobservedCosts).toBeNull()});
  it("does not allocate ambiguous tracking references",()=>{const rows=reconcileShipping([{orderId:"o1",shippingRevenue:parseMoney("5","USD"),trackingNumbers:["T1"],costCoverage:"complete"},{orderId:"o2",shippingRevenue:parseMoney("5","USD"),trackingNumbers:["T1"],costCoverage:"complete"}],[{evidenceId:"e1",trackingNumber:"T1",amount:parseMoney("2","USD")}]);expect(rows.every(r=>r.evidenceIds.length===0)).toBe(true)});
  it("replays historical revenue without demand claims",()=>{const r=simulateHistoricalShippingRevenue([{orderId:"1",subtotal:parseMoney("40","USD"),shippingCollected:parseMoney("8","USD")},{orderId:"2",subtotal:parseMoney("120","USD"),shippingCollected:parseMoney("0","USD")}],{flatRate:parseMoney("6","USD"),freeShippingThreshold:parseMoney("100","USD")});expect(r.revenueDeltaMinor).toBe("-200");expect(r.warning).toContain("not a forecast");expect(r.assumptions.join(" ")).toContain("historical proxy")});
  it("requires distinct approval and verifies read-back",()=>{const draft={id:"c1",state:"pending_approval" as const,baselineFingerprint:"abc",desiredConfiguration:{},createdBy:"owner"};const approved=approve(draft,"reviewer","abc");expect(approved.state).toBe("approved");expect(verify(beginExecution(approved,"abc"),true).state).toBe("verified");expect(()=>approve(draft,"owner","abc")).toThrow()});
  it("marks stale proposals instead of executing against changed configuration",()=>{const draft={id:"c2",state:"pending_approval" as const,baselineFingerprint:"old",desiredConfiguration:{},createdBy:"owner"};expect(approve(draft,"reviewer","new").state).toBe("stale")});
  it("matches a carrier CSV Shopify order name to its persisted order",()=>{const rows=reconcileShipping([{orderId:"gid://shopify/Order/1",orderName:"#1042",shippingRevenue:parseMoney("5","USD"),trackingNumbers:[],costCoverage:"partial"}],[{evidenceId:"e1",orderReference:"#1042",amount:parseMoney("2","USD")}]);expect(rows[0]?.evidenceIds).toEqual(["e1"]);expect(rows[0]?.coverage).toBe("partial")});
  it("parses carrier CSV and preserves invoice line identity",()=>{const rows=parseCarrierCostCsv('invoice_id,charge_id,amount,currency,order_reference\n"INV,100",L1,12.45,USD,#1042');expect(rows[0]?.sourceRecordId).toBe("INV,100:L1");expect(rows[0]?.amountMinor).toBe(1245n)});
  it("deduplicates normalized aliases but rejects competing canonical columns",()=>{expect(parseCarrierCostCsv("invoice_id,charge_id,amount,currency\nI1,L1,1.00,USD")).toHaveLength(1);expect(()=>parseCarrierCostCsv("invoice_id,invoice number,charge_id,amount,currency\nI1,I1,L1,1.00,USD")).toThrow(/multiple columns that map to invoice_id/)});
  it("maps common carrier invoice headers and preserves carrier identity",()=>{const rows=parseCarrierCostCsv("Invoice Number,Charge Line ID,Net Charge Amount,Currency Code,Tracking ID,Carrier Name\nINV-9,LINE-2,18.75,USD,1Z999,UPS");expect(rows[0]?.sourceRecordId).toBe("INV-9:LINE-2");expect(rows[0]?.sourceSystem).toBe("carrier_ups_csv");expect(rows[0]?.trackingNumber).toBe("1Z999");expect(rows[0]?.amountMinor).toBe(1875n)});
  it("accepts UTF-8 BOM and rejects malformed quoted CSV fields",()=>{expect(parseCarrierCostCsv(String.fromCharCode(0xfeff)+`invoice_id,charge_id,amount,currency
I1,L1,1.00,USD`)).toHaveLength(1);expect(()=>parseCarrierCostCsv(`invoice_id,charge_id,amount,currency
I1,L1,"1.00"oops,USD`)).toThrow(/after a closing quote/)});
  it("rejects duplicate invoice charge identities and malformed amounts",()=>{expect(()=>parseCarrierCostCsv("invoice_id,charge_id,amount,currency\nI1,L1,1.00,USD\nI1,L1,2.00,USD")).toThrow(/Duplicate/);expect(()=>parseCarrierCostCsv("invoice_id,charge_id,amount,currency\nI1,L1,1.001,USD")).toThrow(/precision/)});
});


import {reconcileThreePLInvoices} from "./threepl-control";

describe("NODUS 3PL billing control",()=>{
  const rules=[{id:"rate-pick",chargeCode:"PICK",unit:"each",pricing:"per_unit" as const,rate:parseMoney("0.50","USD"),effectiveFrom:"2026-01-01"}];
  const baseLine={id:"line-1",invoiceId:"inv-1",chargeCode:"PICK",billedAt:"2026-11-01",quantity:"10",unit:"each",amount:parseMoney("6.00","USD")};

  it("calculates a contract-rate variance with exact decimal arithmetic",()=>{
    const result=reconcileThreePLInvoices({rules,invoiceLines:[baseLine],activity:[]});
    expect(result.lines[0]?.expectedMinor).toBe("500");
    expect(result.lines[0]?.varianceMinor).toBe("100");
    expect(result.findings[0]?.code).toBe("contract_rate_variance");
    expect(result.findings[0]?.state).toBe("calculated_variance");
  });

  it("does not infer a quantity overcharge when operational activity evidence is absent",()=>{
    const result=reconcileThreePLInvoices({rules,invoiceLines:[baseLine],activity:[]});
    expect(result.findings.some(f=>f.code==="billed_quantity_exceeds_activity")).toBe(false);
  });

  it("compares billed quantity only on an exact activity reference",()=>{
    const line={...baseLine,activityReference:"FUL-44"};
    const result=reconcileThreePLInvoices({rules,invoiceLines:[line],activity:[{id:"act-1",reference:"FUL-44",chargeCode:"PICK",quantity:"8",unit:"each"}]});
    expect(result.lines[0]?.activityQuantity).toBe("8");
    expect(result.findings.some(f=>f.code==="billed_quantity_exceeds_activity")).toBe(true);
  });

  it("does not match activity records on a different reference",()=>{
    const line={...baseLine,activityReference:"FUL-44"};
    const result=reconcileThreePLInvoices({rules,invoiceLines:[line],activity:[{id:"act-1",reference:"FUL-45",chargeCode:"PICK",quantity:"8",unit:"each"}]});
    expect(result.findings.some(f=>f.code==="billed_quantity_exceeds_activity")).toBe(false);
  });


  it("does not case-fold an operational reference that must match exactly",()=>{
    const line={...baseLine,activityReference:"FUL-44"};
    const result=reconcileThreePLInvoices({rules,invoiceLines:[line],activity:[{id:"act-1",reference:"ful-44",chargeCode:"PICK",quantity:"8",unit:"each"}]});
    expect(result.findings.some(f=>f.code==="billed_quantity_exceeds_activity")).toBe(false);
  });

  it("withholds a rate conclusion when the contract rule is ambiguous",()=>{
    const duplicateRule={...rules[0]!,id:"rate-pick-overlap"};
    const result=reconcileThreePLInvoices({rules:[...rules,duplicateRule],invoiceLines:[baseLine],activity:[]});
    expect(result.lines[0]?.state).toBe("needs_review");
    expect(result.findings[0]?.code).toBe("contract_rule_ambiguous");
    expect(result.lines[0]?.expectedMinor).toBeUndefined();
  });

  it("flags an invoice line with no effective contract rate as unpriced",()=>{
    const line={...baseLine,billedAt:"2025-12-31"};
    const result=reconcileThreePLInvoices({rules,invoiceLines:[line],activity:[]});
    expect(result.lines[0]?.state).toBe("unpriced");
    expect(result.findings[0]?.code).toBe("unpriced_charge");
  });

  it("rejects duplicate invoice line IDs and invalid quantity precision",()=>{
    expect(()=>reconcileThreePLInvoices({rules,invoiceLines:[baseLine,baseLine],activity:[]})).toThrow(/IDs must be present and unique/);
    expect(()=>reconcileThreePLInvoices({rules,invoiceLines:[{...baseLine,quantity:"1.0001"}],activity:[]})).toThrow(/at most three places/);
  });
});
