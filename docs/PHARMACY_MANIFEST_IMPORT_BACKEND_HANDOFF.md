# Backend request: pharmacy delivery spreadsheet import

## Purpose and current frontend

Pharmacy staff should enter deliveries in a form or import a supplier spreadsheet. They should not have to prepare JSON or understand API field names.

The frontend now supports manual pack entry, a date picker, add/remove pack controls, and CSV import with a blank template. Imported CSV rows are editable and require an explicit Save delivery list action. Both paths send the existing `POST /api/manifests` body `{ reference, packs: [{ gtin, lot, serial, expiry }] }`. No backend change is needed for these paths. Preserve that endpoint, its validation, facility authorization, audit behavior and atomic saves.

Please implement native Excel (.xlsx) import and server-side spreadsheet preview as follows. These endpoints are proposed and are not called by the current frontend. Keep the existing JSON endpoints for compatibility. PDF/OCR and legacy .xls are outside this request; do not silently treat delivery totals or batch-only rows as serialized packs.

## 1. Download a template

`GET /api/manifests/import/template?format=xlsx` (also support `format=csv`).

Return a downloadable file with these user-facing columns, no sample medicine/pack rows, and brief instructions:

| Spreadsheet column | Internal field | Required content |
| --- | --- | --- |
| Barcode (GTIN) | gtin | Exactly 14 digits, valid check digit, stored as text |
| Batch number | lot | 1–20 printable characters without spaces |
| Serial number | serial | 1–20 printable characters without spaces, unique per GTIN within the delivery |
| Expiry date | expiry | Valid date; display YYYY-MM-DD |

Format GTIN, batch and serial columns as text in Excel. Include instructions to enter one row per individual pack/vial and preserve leading zeros and letter case. A quantity column cannot replace serial numbers. The delivery reference is entered separately in the UI.

## 2. Preview a spreadsheet without saving

`POST /api/manifests/import/preview`, multipart:

- `file`: CSV or .xlsx, maximum 5 MiB.
- `reference`: the delivery reference, 1–120 characters.
- Do not accept a facility ID. Derive facility and actor from the authenticated session.

Use existing active, verified facility membership with `inventory.manage`. Read at most 1,000 nonempty pack rows. Reject multiple nonempty worksheets unless the response explicitly asks the user to choose a sheet; do not silently ignore other sheets. Bound workbook expansion and cell counts, and reject formulas rather than executing or treating cached values as identifiers.

Accept the four template headers and existing internal names (`gtin`, `lot`, `serial`, `expiry`), in any order, without case sensitivity for headers. Preserve identifier content exactly. Reject duplicate/ambiguous columns, missing columns, unexpected data columns and numeric/scientific-notation identifiers whose original text cannot be trusted. Explain how to correct the affected cells. Do not invent missing serials, pad shortened identifiers, normalize letter case, or guess ambiguous dates such as 03/04/27. Support ISO dates and real Excel date cells using the workbook's declared date system; return ISO dates.

Perform the same validation as manifest creation, including duplicate GTIN+serial within the file and existing reference/pack conflicts at the current facility. A duplicate at another facility must not expose that facility's records. Preview writes no manifest, stock or dispensing event.

Return HTTP 200 with the existing envelope for a readable spreadsheet, including validation issues:

```json
{
  "success": true,
  "message": "Delivery spreadsheet reviewed.",
  "data": {
    "reference": "<submitted delivery reference>",
    "canImport": false,
    "totalRows": 12,
    "validRows": 11,
    "packs": [],
    "issues": [
      {
        "row": 5,
        "field": "serial",
        "code": "SERIAL_REQUIRED",
        "message": "Row 5: enter the serial number printed on this pack."
      }
    ]
  }
}
```

The counts above illustrate the response shape only. Return actual counts. Row numbers refer to worksheet/file rows, including the header. Return `packs` containing every normalized pack only when `canImport` is true; otherwise return an empty array and all row issues. Do not offer a partial import. For a valid preview, `issues` is empty, `validRows === totalRows`, and each pack contains only `gtin`, `lot`, `serial`, and `expiry`.

Useful issue codes: `COLUMN_REQUIRED`, `COLUMN_AMBIGUOUS`, `IDENTIFIER_MUST_BE_TEXT`, `INVALID_GTIN`, `BATCH_REQUIRED`, `SERIAL_REQUIRED`, `INVALID_EXPIRY`, `DUPLICATE_PACK_IN_FILE`, `PACK_ALREADY_IMPORTED`, `REFERENCE_ALREADY_EXISTS`, `ROW_LIMIT_EXCEEDED`.

Use 400 for unreadable/malformed files, 413 for oversize files, 415 for unsupported formats, and existing 401/403 authentication and authorization responses. Errors must be actionable pharmacy-facing messages and must not include SQL, stack traces or other facilities' records.

## 3. Save after review

After preview, the frontend allows corrections and submits the reviewed reference and all pack rows to the existing `POST /api/manifests`. Keep the response envelope and manifest `id`, `reference` and `packCount`. Revalidate all fields, permissions and conflicts inside the save transaction. Preview is advisory; a concurrent save may introduce a conflict before confirmation.

Improve validation responses from manifest creation to provide the same `issues: [{ row, field, code, message }]` structure in `data` for 400/422 and 409 responses, while retaining existing top-level `success`, `message` and status semantics. For manually entered rows, define row 1 as the first pack card; the frontend maps spreadsheet row numbers during preview. No partial saves on errors. On network/timeout uncertainty, the UI checks saved deliveries by reference before retrying; do not claim that a timeout rolled back the save.

## Acceptance checks

Verify leading-zero and case preservation, valid/invalid check digits, missing serials, duplicate rows, invalid/leap dates, numeric/formula identifier cells, Excel date systems, column mapping, size/row limits, conflicting references/packs, transaction rollback, permissions, facility scoping and concurrent saves. Native spreadsheet import must not call product-record verification, modify inventory or create dispensing events. Existing dispensing UUID/replay and duplicate protection stay in force.
