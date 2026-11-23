import { describe, expect, it } from "vitest";
import { canWrite, dateOnly, moneyMinor, parseCsv, quantity, sameOrigin } from "./threepl";

describe("NODUS request origin protection",()=>{
  it("accepts an exact same-origin Origin header",()=>{
    expect(sameOrigin(new Request("https://nodus.example/api", {headers:{Origin:"https://nodus.example"}}))).toBe(true);
  });
  it("rejects cross-origin, malformed and unverifiable requests",()=>{
    expect(sameOrigin(new Request("https://nodus.example/api", {headers:{Origin:"https://attacker.example"}}))).toBe(false);
    expect(sameOrigin(new Request("https://nodus.example/api", {headers:{Origin:"not a url"}}))).toBe(false);
    expect(sameOrigin(new Request("https://nodus.example/api"))).toBe(false);
  });
  it("uses same-origin Fetch Metadata only when Origin is absent",()=>{
    expect(sameOrigin(new Request("https://nodus.example/api", {headers:{"Sec-Fetch-Site":"same-origin"}}))).toBe(true);
    expect(sameOrigin(new Request("https://nodus.example/api", {headers:{"Sec-Fetch-Site":"cross-site"}}))).toBe(false);
  });
});

describe("NODUS D1 source validation",()=>{
  it("parses quoted commas and escaped quotes without losing source columns",()=>{
    const parsed=parseCsv('charge_code,description\nPICK,"pick, pack"\nLABEL,"said ""fragile"""');
    expect(parsed.headers).toEqual(["charge_code","description"]);
    expect(parsed.rows).toEqual([["PICK","pick, pack"],["LABEL",'said "fragile"']]);
  });
  it("rejects malformed and inconsistent CSV input",()=>{
    expect(()=>parseCsv('code,code\nA,B')).toThrow("non-empty and unique");
    expect(()=>parseCsv('code,amount\nA')).toThrow("inconsistent number");
    expect(()=>parseCsv('code,amount\nA,"unfinished')).toThrow("unterminated");
  });
  it("uses integer minor units and currency-specific decimal precision",()=>{
    expect(moneyMinor("12.34","USD").minor).toBe(1234n);
    expect(moneyMinor("125","JPY").minor).toBe(125n);
    expect(moneyMinor("1.234","KWD").minor).toBe(1234n);
    expect(moneyMinor("-12.34","USD",true).minor).toBe(-1234n);
    expect(()=>moneyMinor("-1.00","USD")).toThrow("precision");
    expect(()=>moneyMinor("1.001","USD")).toThrow("precision");
  });
  it("validates dates and positive fixed-precision quantities",()=>{
    expect(dateOnly("2026-10-31")).toBe("2026-10-31");
    expect(()=>dateOnly("2026-02-30")).toThrow("Invalid calendar date");
    expect(quantity("1.250")).toBe("1.250");
    expect(()=>quantity("0")).toThrow("positive, finite decimals");
    expect(()=>quantity("1.2345")).toThrow("positive, finite decimals");
  });
  it("keeps onboarding writable, expires trials and honours paid period ends",()=>{
    const base={id:"w",business_name:"Merchant",owner_name:"Owner",owner_email:"owner@example.test",shop_domain:null,status:"trial",plan_code:null,trial_activated_at:null,trial_ends_at:null,subscription_status:"none",subscription_started_at:null,subscription_ends_at:null};
    expect(canWrite({...base,status:"onboarding"})).toBe(true);
    expect(canWrite({...base,trial_ends_at:new Date(Date.now()+60000).toISOString()})).toBe(true);
    expect(canWrite({...base,trial_ends_at:new Date(Date.now()-60000).toISOString()})).toBe(false);
    expect(canWrite({...base,status:"active",subscription_status:"cancelled",subscription_ends_at:new Date(Date.now()+60000).toISOString()})).toBe(true);
    expect(canWrite({...base,status:"active",subscription_status:"active",subscription_ends_at:new Date(Date.now()-60000).toISOString()})).toBe(false);
  });
});
