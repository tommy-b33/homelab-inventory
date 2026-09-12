/**
 * TypeScript façade over partsCsv.mjs (shared with the production server).
 */
export {
  PART_COLUMNS,
  CATEGORIES,
  CONDITIONS,
  PHASES,
  escapeCsvField,
  serializePartsCsv,
  validateParts,
} from "../../partsCsv.mjs";

export type PartColumn =
  | "id"
  | "category"
  | "manufacturer"
  | "model"
  | "key_specs"
  | "qty"
  | "condition"
  | "location"
  | "assigned_build"
  | "for_phase"
  | "notes";

export type PartRow = Record<PartColumn, string>;
