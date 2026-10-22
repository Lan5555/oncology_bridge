export function reportDownload(data: unknown): {
  blob: Blob;
  filename: string;
} {
  if (!data || typeof data !== "object")
    throw new Error("The API returned no report file.");
  const row = data as Record<string, unknown>;
  if (typeof row.csv === "string")
    return {
      blob: new Blob([row.csv], { type: "text/csv;charset=utf-8" }),
      filename: "oncosourz-report.csv",
    };
  const supported = [
    "text/csv",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];
  if (
    typeof row.fileName !== "string" ||
    !row.fileName.trim() ||
    [...row.fileName].some(
      (char) => char.charCodeAt(0) < 32 || char === "/" || char === "\\",
    ) ||
    typeof row.mimeType !== "string" ||
    !supported.includes(row.mimeType) ||
    typeof row.contentBase64 !== "string" ||
    !row.contentBase64
  )
    throw new Error("The API returned an invalid report file.");
  const bytes = Uint8Array.from(atob(row.contentBase64), (char) =>
    char.charCodeAt(0),
  );
  return {
    blob: new Blob([bytes], { type: row.mimeType }),
    filename: row.fileName,
  };
}
