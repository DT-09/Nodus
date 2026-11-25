import {describe,it,expect} from "vitest";
import {analyzeConversion,parseConversionCsv} from "./conversion";
describe("NODUS conversion diagnostics",()=>{
 it("identifies checkout completion as the largest deterioration",()=>{const rows=parseConversionCsv("period,segment,sessions,added_to_cart,reached_checkout,purchases\nbaseline,All,10000,1200,800,600\ncurrent,All,10000,1200,800,400");const r=analyzeConversion(rows);expect(r.leadFinding?.title).toContain("Checkout completion");expect(r.lostOrdersEstimate).toBe(200);});
 it("finds the weakest deteriorating segment",()=>{const rows=parseConversionCsv("period,segment,sessions,added_to_cart,reached_checkout,purchases\nbaseline,Mobile,5000,600,400,300\ncurrent,Mobile,5000,600,400,200\nbaseline,Desktop,5000,600,400,300\ncurrent,Desktop,5000,600,400,290");expect(analyzeConversion(rows).segmentFindings[0]?.segment).toBe("Mobile");});
 it("supports a current-only funnel without inventing a comparison",()=>{const r=analyzeConversion(parseConversionCsv("period,sessions,added_to_cart,reached_checkout,purchases\ncurrent,1000,100,60,20"));expect(r.baseline).toBeNull();expect(r.changes).toHaveLength(0);expect(r.lostOrdersEstimate).toBeNull();});
 it("rejects missing columns and invalid counts",()=>{expect(()=>parseConversionCsv("period,sessions,purchases\ncurrent,10,1")).toThrow(/added_to_cart/);expect(()=>parseConversionCsv("period,sessions,added_to_cart,reached_checkout,purchases\ncurrent,10,-1,2,1")).toThrow(/whole/);});
 it("flags inconsistent event definitions without hiding results",()=>{const r=analyzeConversion(parseConversionCsv("period,sessions,added_to_cart,reached_checkout,purchases\ncurrent,10,12,8,9"));expect(r.warnings.length).toBeGreaterThan(0);});
});
