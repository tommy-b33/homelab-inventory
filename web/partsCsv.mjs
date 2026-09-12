/** Shared part field order — keep in sync with inventory/parts.csv */
export const PART_COLUMNS = [
  "id",
  "category",
  "manufacturer",
  "model",
  "key_specs",
  "qty",
  "condition",
  "location",
  "assigned_build",
  "for_phase",
  "notes",
];

export const CATEGORIES = [
  "RAM",
  "CPU",
  "GPU",
  "MB",
  "CASE",
  "PSU",
  "FAN",
  "NIC",
  "HBA",
  "STORAGE",
  "COOLER",
  "MONITOR",
  "OTHER",
];

export const CONDITIONS = [
  "installed",
  "spare",
  "ordered",
  "planned",
  "dead",
  "sold",
];

export const PHASES = ["current", "planned"];

export function escapeCsvField(value) {
  const v = value ?? "";
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

export function serializePartsCsv(parts) {
  const header = PART_COLUMNS.join(",");
  const lines = parts.map((p) =>
    PART_COLUMNS.map((col) => escapeCsvField(String(p[col] ?? ""))).join(","),
  );
  return `${header}\n${lines.join("\n")}\n`;
}

export function validateParts(parts) {
  if (!Array.isArray(parts)) return { ok: false, error: "parts must be an array" };
  const rows = [];
  const seen = new Set();
  for (let i = 0; i < parts.length; i++) {
    const raw = parts[i];
    if (!raw || typeof raw !== "object") {
      return { ok: false, error: `Row ${i} is not an object` };
    }
    const id = String(raw.id ?? "").trim();
    if (!id) return { ok: false, error: `Row ${i} missing id` };
    if (seen.has(id)) return { ok: false, error: `Duplicate id: ${id}` };
    seen.add(id);
    const row = {};
    for (const col of PART_COLUMNS) {
      row[col] = raw[col] == null ? "" : String(raw[col]);
    }
    row.id = id;
    rows.push(row);
  }
  return { ok: true, parts: rows };
}
