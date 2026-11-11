# ARAYA — Null Array Crash Fix (Divisions, Products, Transactions, Cart)

## Root cause
Several frontend pages assumed list responses were always arrays. Older/empty tenant API responses can return `data: null`. That caused `.length` and `.map()` runtime exceptions, including the reported DivisionsPage and DataTable errors.

## Fixes
1. Shared `DataTable` now accepts null/undefined and malformed data defensively, converting it to an empty array before checking `.length` or mapping rows. This protects product, customer, quotation, invoice, order, service-request and other table screens using the shared component.
2. Divisions page normalizes the divisions response before storing it in state and guards the empty-state length check.
3. M2 list API functions normalize units, divisions and categories to arrays. Pagination fetch helpers now receive normalized page arrays.
4. M4 list API functions normalize products, customers, quotations, invoices and orders.
5. M3 partner lists and M1 audit/user lists normalize API list payloads.
6. M5 public business units/products and service request lists normalize arrays.
7. Cart API normalizes `items`, totals and item counts for fetch/add/update/remove responses. CartContext and CartPage also defensively normalize cart items, so missing/null `items` is treated as an empty cart.
8. Existing transaction forms keep their user-entered line-item state intact; these are not API list arrays and are not reset.

## Backend
No BE change is required for this issue. The current backend shared `response.List` helper already converts nil slices to an empty JSON array (`[]`). The remaining failures are handled at the FE API boundary and shared UI component.

## Verification
- Source-level scan: reported `.length` and `.map()` paths for Divisions, DataTable, product lists, transaction tables and cart are guarded/normalized.
- TypeScript build could not be run in this extracted environment because dependencies are not installed (`vite/client` type definitions are missing).
- Vite production build and browser/Supabase end-to-end tests were not run in this environment.
- No Supabase migration is required.

## Deployment
Replace the FE source using the provided archive. Keep `.env` and database unchanged. Restart the Vite dev server. Hard refresh the browser after restart.
