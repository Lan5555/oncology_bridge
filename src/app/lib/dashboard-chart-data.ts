export type DashboardSeriesKey =
  | "inventoryOverTime"
  | "drugSplit"
  | "redistributionEfficiency"
  | "therapeuticStock";
const fields = {
  inventoryOverTime: {
    alias: "inventory_over_time",
    labels: ["label", "date"],
    values: ["vials", "qty", "quantity"],
  },
  drugSplit: {
    alias: "drug_split",
    labels: ["drug", "name"],
    values: ["pct", "percentage"],
  },
  redistributionEfficiency: {
    alias: "redistribution_efficiency",
    labels: ["label"],
    values: ["quantity"],
  },
  therapeuticStock: {
    alias: "therapeutic_stock",
    labels: ["drug", "name"],
    values: ["qty", "quantity"],
  },
};

export type DashboardPoint = {
  label: string;
  value: number;
  unit: string;
  quantitiesByUnit?: Record<string, number>;
  id?: string;
};
export const unitLabel = (unit: string) =>
  ({
    vial: "Vials",
    box: "Boxes",
    pack: "Packs",
    bottle: "Bottles",
    unknown: "Unreviewed units",
  })[unit] ?? "Unreviewed units";

export function dashboardSeries(
  data: unknown,
  key: DashboardSeriesKey,
): DashboardPoint[] {
  const config = fields[key];
  const object = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const root = object(data);
  const nested = object(root.data);
  const sources = [root, object(root.charts), nested, object(nested.charts)];
  const source = sources.find(
    (candidate) => key in candidate || config.alias in candidate,
  );
  if (!source) throw new Error(`The dashboard API did not return ${key}.`);
  const rows = source[key] ?? source[config.alias];
  if (!Array.isArray(rows))
    throw new Error(`The dashboard API returned an invalid ${key} series.`);
  return rows.map((item, index) => {
    const row = object(item);
    const label = config.labels
      .map((name) => row[name])
      .find((value) => typeof value === "string" && value.trim());
    const raw = config.values
      .map((name) => row[name])
      .find((value) => value !== undefined);
    const number =
      typeof raw === "number" || (typeof raw === "string" && raw.trim())
        ? Number(raw)
        : Number.NaN;
    if (typeof label !== "string" || !Number.isFinite(number) || number < 0)
      throw new Error(
        `The dashboard API returned an invalid row in ${key} (row ${index + 1}).`,
      );
    const rawUnit =
      typeof row.unit === "string" ? row.unit.toLowerCase() : "unknown";
    const unit = ["vial", "box", "pack", "bottle"].includes(rawUnit)
      ? rawUnit
      : "unknown";
    const point: DashboardPoint = {
      label,
      value: number,
      unit: key === "inventoryOverTime" ? "vial" : unit,
    };
    if (typeof row.id === "string") point.id = row.id;
    if (key === "inventoryOverTime" && row.quantitiesByUnit != null) {
      const quantities = object(row.quantitiesByUnit);
      point.quantitiesByUnit = {};
      for (const name of ["vial", "box", "pack", "bottle", "unknown"]) {
        const quantity = quantities[name];
        if (quantity === undefined) continue;
        if (
          typeof quantity !== "number" ||
          !Number.isFinite(quantity) ||
          quantity < 0
        )
          throw new Error("Invalid quantitiesByUnit in inventoryOverTime.");
        point.quantitiesByUnit[name] = quantity;
      }
    }
    return point;
  });
}

export function unitSeries(
  rows: DashboardPoint[],
  preferred: string,
  cohorts = false,
) {
  const units = ["vial", "box", "pack", "bottle", "unknown"].filter((unit) =>
    rows.some((row) =>
      cohorts
        ? row.quantitiesByUnit
          ? (row.quantitiesByUnit[unit] ?? 0) > 0
          : row.unit === unit && row.value > 0
        : row.unit === unit,
    ),
  );
  const selected = units.includes(preferred) ? preferred : (units[0] ?? "vial");
  const selectedRows = cohorts
    ? rows.map((row) => ({
        ...row,
        value: row.quantitiesByUnit
          ? (row.quantitiesByUnit[selected] ?? 0)
          : row.unit === selected
            ? row.value
            : 0,
      }))
    : rows.filter((row) => row.unit === selected);
  return { units, selected, rows: selectedRows };
}
