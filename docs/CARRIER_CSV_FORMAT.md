# Carrier cost CSV format

NODUS currently accepts carrier cost evidence in CSV form only. This is a structured row import, not automated PDF extraction.

## Required columns

| Column | Meaning |
|---|---|
| invoice_id | Carrier invoice identifier |
| charge_id | Unique charge/line identifier within the invoice |
| amount | Decimal amount as printed on the invoice |
| currency | Three-letter ISO 4217 code |

## Optional columns

| Column | Meaning |
|---|---|
| order_reference | Exact Shopify order reference, if present |
| tracking_number | Exact tracking number, if present |
| occurred_at | ISO-8601 charge date |
| cost_type | Merchant/carrier-defined cost category |

Example:

```csv
invoice_id,charge_id,amount,currency,order_reference,tracking_number,occurred_at,cost_type
INV-100,LINE-001,12.45,USD,#1042,TRACK123,2026-10-12,base_shipping
INV-100,LINE-002,3.25,USD,#1042,TRACK123,2026-10-13,adjustment
```

Rows are deduplicated by invoice ID plus charge ID. Currency precision is validated. Invalid rows reject the import. Ambiguous order/tracking references are retained as evidence but are not allocated to an order. Imported amounts are not automatically described as complete shipping cost; a merchant must establish coverage before any order-level contribution is calculated.
