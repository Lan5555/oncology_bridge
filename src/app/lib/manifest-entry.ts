import type { PackIdentifiers } from "./pharmacy-dispensing";

export type ManifestInput = { reference: string; packs: PackIdentifiers[] };
export const MANIFEST_CSV_TEMPLATE =
  "Barcode (GTIN),Batch number,Serial number,Expiry date\r\n";

export function validateManifestInput(
  reference: string,
  packs: PackIdentifiers[],
): ManifestInput {
  if (!reference.trim() || reference.trim().length > 120)
    throw new Error("Enter a delivery reference of up to 120 characters.");
  if (!packs.length || packs.length > 1000)
    throw new Error("Add between 1 and 1,000 packs to this delivery.");
  const identities = new Set<string>();
  packs.forEach((pack, index) => {
    const row = `Pack ${index + 1}`;
    if (!/^\d{14}$/.test(pack.gtin))
      throw new Error(
        `${row}: enter the full 14-digit barcode number, including leading zeros.`,
      );
    const digits = [...pack.gtin].map(Number);
    if (
      digits.reduce((sum, digit, i) => sum + digit * (i % 2 === 0 ? 3 : 1), 0) %
        10 !==
      0
    )
      throw new Error(
        `${row}: the barcode number has an invalid check digit. Check it against the pack.`,
      );
    if (!/^[!-~]{1,20}$/.test(pack.lot))
      throw new Error(
        `${row}: enter a batch number of 1–20 characters, without spaces.`,
      );
    if (!/^[!-~]{1,20}$/.test(pack.serial))
      throw new Error(
        `${row}: enter a serial number of 1–20 characters, without spaces.`,
      );
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(pack.expiry) ||
      !Number.isFinite(Date.parse(`${pack.expiry}T00:00:00Z`)) ||
      new Date(`${pack.expiry}T00:00:00Z`).toISOString().slice(0, 10) !==
        pack.expiry
    )
      throw new Error(`${row}: enter a valid expiry date as YYYY-MM-DD.`);
    const identity = `${pack.gtin}:${pack.serial}`;
    if (identities.has(identity))
      throw new Error(
        `${row}: this barcode and serial number already appear in the delivery. Remove the repeated pack.`,
      );
    identities.add(identity);
  });
  return {
    reference: reference.trim(),
    packs: packs.map((pack) => ({ ...pack })),
  };
}

// Read quoted CSV cells without converting identifier strings to numbers.
export function parseManifestCsv(text: string): PackIdentifiers[] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false,
    closed = false;
  const input = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') {
        quoted = false;
        closed = true;
      } else cell += char;
    } else if (char === '"' && !cell && !closed) quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
      closed = false;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      closed = false;
    } else {
      if (closed || char === '"')
        throw new Error(
          "The spreadsheet has a broken quoted cell. Save it as CSV again or use the template.",
        );
      cell += char;
    }
  }
  if (quoted)
    throw new Error(
      "The spreadsheet has an unfinished quoted cell. Save it as CSV again.",
    );
  if (cell || row.length || closed) {
    row.push(cell);
    rows.push(row);
  }
  const nonempty = rows.filter((cells) => cells.some((value) => value !== ""));
  const headers = nonempty.shift()?.map((value) => value.trim().toLowerCase());
  const aliases: Record<keyof PackIdentifiers, string[]> = {
    gtin: ["barcode (gtin)", "gtin", "barcode"],
    lot: ["batch number", "batch", "lot"],
    serial: ["serial number", "serial"],
    expiry: ["expiry date", "expiry"],
  };
  const columns = Object.fromEntries(
    Object.entries(aliases).map(([key, names]) => {
      const matches =
        headers?.flatMap((name, index) =>
          names.includes(name) ? [index] : [],
        ) ?? [];
      if (matches.length !== 1)
        throw new Error(`Use the template with one column for ${names[0]}.`);
      return [key, matches[0]];
    }),
  ) as Record<keyof PackIdentifiers, number>;
  if (headers?.length !== 4)
    throw new Error(
      "Use the four template columns only: barcode, batch number, serial number and expiry date.",
    );
  if (!nonempty.length || nonempty.length > 1000)
    throw new Error("The spreadsheet must contain between 1 and 1,000 packs.");
  return nonempty.map((cells, index) => {
    if (cells.length !== 4)
      throw new Error(
        `Spreadsheet row ${index + 2}: use all four template columns.`,
      );
    return {
      gtin: cells[columns.gtin],
      lot: cells[columns.lot],
      serial: cells[columns.serial],
      expiry: cells[columns.expiry],
    };
  });
}
