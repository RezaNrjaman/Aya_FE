# ARAYA FE — Quotation Unit Selector Fix

## Diagnosis from source
The quotation modal fetched customers and units only once when the modal component first mounted. The modal remains mounted while closed, so if the Partner opens it before unit data is ready or creates/activates a unit later, the selector can remain empty/stale. Errors from the fetch were silently swallowed (`catch(() => {})`), making the selector appear nonfunctional without showing the cause.

The unit list is fetched through `fetchAllTenantUnits()` which uses the authenticated M2 admin business-unit endpoint and therefore still depends on the current user's tenant linkage and `m2.business_units.read` permission.

## Changes
- Fetch quotation customers and business units each time the quotation modal opens.
- Show loading state while business units are being fetched.
- Show a clear error/empty message when no active units are available or the request fails.
- Replace the native unit dropdown with the shared searchable selector.
- Display business unit name and Partner name where available.
- Disable quotation submission until a unit is loaded and selected.
- Validate `unit_usaha_id` and `customer_id` before submitting.
- Preserve existing quotation item editing behavior.

## Backend / database
No backend source or Supabase migration change is required for this frontend fix.

## Verification
- Source assertions: PASS.
- TypeScript/Vite build: NOT RUN in this environment because the extracted FE package does not include installed dependencies.
- Browser test against the user's local API/Supabase: NOT RUN.
