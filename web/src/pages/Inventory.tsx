import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { Link } from "react-router-dom";
import { loadParts, saveParts, type Part } from "../lib/data";
import { CATEGORIES, CONDITIONS, PHASES } from "../lib/partsCsv";

type SortKey =
  | "id"
  | "category"
  | "manufacturer"
  | "model"
  | "key_specs"
  | "qty"
  | "condition"
  | "for_phase"
  | "location"
  | "assigned_build"
  | "notes";

type EditField = Exclude<SortKey, "id">;

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "category", label: "Cat" },
  { key: "manufacturer", label: "Mfr" },
  { key: "model", label: "Model" },
  { key: "key_specs", label: "Specs" },
  { key: "qty", label: "Qty" },
  { key: "condition", label: "Condition" },
  { key: "for_phase", label: "Phase" },
  { key: "location", label: "Location" },
  { key: "assigned_build", label: "Build" },
  { key: "notes", label: "Notes" },
];

function cellValue(p: Part, key: SortKey): string {
  if (key === "qty") return p.qty;
  return p[key] ?? "";
}

function phaseOf(p: Part): string {
  return p.for_phase?.trim() || "current";
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

type Editing = { id: string; field: EditField } | null;

export default function Inventory() {
  const [parts, setParts] = useState<Part[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");
  const [condition, setCondition] = useState("all");
  const [build, setBuild] = useState("all");
  const [phase, setPhase] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [editing, setEditing] = useState<Editing>(null);
  const editingRef = useRef<Editing>(null);
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const saveTimer = useRef<number | null>(null);
  const skipBlurSave = useRef(false);

  function setDraftValue(value: string) {
    draftRef.current = value;
    setDraft(value);
  }

  useEffect(() => {
    loadParts()
      .then(setParts)
      .catch((e: Error) => setError(e.message));
  }, []);

  const categories = useMemo(() => {
    const fromData = parts.map((p) => p.category).filter(Boolean);
    return [...new Set([...CATEGORIES, ...fromData])].sort();
  }, [parts]);
  const conditions = useMemo(() => {
    const fromData = parts.map((p) => p.condition).filter(Boolean);
    return [...new Set([...CONDITIONS, ...fromData])].sort();
  }, [parts]);
  const builds = useMemo(
    () => [...new Set(parts.map((p) => p.assigned_build).filter(Boolean))].sort(),
    [parts],
  );
  const phases = useMemo(() => {
    const fromData = parts.map((p) => phaseOf(p)).filter(Boolean);
    return [...new Set([...PHASES, ...fromData])].sort();
  }, [parts]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const rows = parts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (condition !== "all" && p.condition !== condition) return false;
      if (build !== "all" && p.assigned_build !== build) return false;
      if (phase !== "all" && phaseOf(p) !== phase) return false;
      if (!needle) return true;
      const blob = [
        p.id,
        p.category,
        p.manufacturer,
        p.model,
        p.key_specs,
        p.location,
        p.assigned_build,
        phaseOf(p),
        p.notes,
      ]
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });

    const dir = sortDir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = sortKey === "for_phase" ? phaseOf(a) : cellValue(a, sortKey);
      const bv = sortKey === "for_phase" ? phaseOf(b) : cellValue(b, sortKey);
      if (sortKey === "qty") {
        return (Number(av) - Number(bv)) * dir;
      }
      return av.localeCompare(bv, undefined, { sensitivity: "base" }) * dir;
    });
  }, [parts, q, category, condition, build, phase, sortKey, sortDir]);

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function startEdit(p: Part, field: EditField) {
    const value = p[field] ?? "";
    const next = { id: p.id, field };
    editingRef.current = next;
    setEditing(next);
    setDraftValue(value);
  }

  async function commitEdit(nextValue?: string) {
    const ed = editingRef.current;
    if (!ed) return;
    const { id, field } = ed;
    const value = nextValue ?? draftRef.current;
    const previousParts = parts;
    const current = previousParts.find((p) => p.id === id);
    const prev = current?.[field] ?? "";
    editingRef.current = null;
    setEditing(null);

    if (!current || value === prev) return;

    const nextParts = previousParts.map((p) => (p.id === id ? { ...p, [field]: value } : p));
    setParts(nextParts);
    setSaveStatus("saving");
    setSaveError(null);
    try {
      await saveParts(nextParts);
      setSaveStatus("saved");
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      saveTimer.current = window.setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      setParts(previousParts);
      setSaveStatus("error");
      setSaveError(e instanceof Error ? e.message : "Save failed");
    }
  }

  function cancelEdit() {
    skipBlurSave.current = true;
    editingRef.current = null;
    setEditing(null);
  }

  function renderDisplay(p: Part, field: EditField) {
    if (field === "condition") {
      return <span className={`pill pill-${p.condition}`}>{p.condition || "—"}</span>;
    }
    if (field === "for_phase") {
      const ph = phaseOf(p);
      return <span className={`pill pill-phase-${ph}`}>{ph}</span>;
    }
    if (field === "assigned_build") {
      return p.assigned_build ? (
        <Link to={`/builds/${p.assigned_build}`} onClick={(e) => e.stopPropagation()}>
          {p.assigned_build}
        </Link>
      ) : (
        "—"
      );
    }
    if (field === "manufacturer") {
      return p.manufacturer ? <strong>{p.manufacturer}</strong> : "—";
    }
    if (field === "notes") {
      return p.notes || "—";
    }
    return p[field] || "—";
  }

  function renderEditor(field: EditField) {
    const onBlur = () => {
      if (skipBlurSave.current) {
        skipBlurSave.current = false;
        return;
      }
      // Select option picks often fire blur before change; defer so change can win.
      window.setTimeout(() => {
        if (editingRef.current) void commitEdit();
      }, 0);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        cancelEdit();
      } else if (e.key === "Enter" && field !== "notes") {
        e.preventDefault();
        void commitEdit();
      }
    };
    const onTextChange = (
      e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    ) => setDraftValue(e.target.value);
    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setDraftValue(v);
      skipBlurSave.current = true;
      void commitEdit(v);
    };

    if (field === "category") {
      return (
        <select
          className="cell-editor"
          value={draft}
          autoFocus
          onChange={onSelectChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      );
    }
    if (field === "condition") {
      return (
        <select
          className="cell-editor"
          value={draft}
          autoFocus
          onChange={onSelectChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      );
    }
    if (field === "for_phase") {
      return (
        <select
          className="cell-editor"
          value={draft}
          autoFocus
          onChange={onSelectChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          {phases.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      );
    }
    if (field === "assigned_build") {
      return (
        <select
          className="cell-editor"
          value={draft}
          autoFocus
          onChange={onSelectChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        >
          <option value="">—</option>
          {builds.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      );
    }
    if (field === "notes") {
      return (
        <textarea
          className="cell-editor"
          value={draft}
          rows={2}
          autoFocus
          onChange={onTextChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      );
    }
    if (field === "qty") {
      return (
        <input
          className="cell-editor"
          type="text"
          inputMode="numeric"
          value={draft}
          autoFocus
          onChange={onTextChange}
          onKeyDown={onKeyDown}
          onBlur={onBlur}
        />
      );
    }
    return (
      <input
        className="cell-editor"
        type="text"
        value={draft}
        autoFocus
        onChange={onTextChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
    );
  }

  if (error) return <p className="error">{error}</p>;
  if (!parts.length) return <p className="muted">Loading inventory…</p>;

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "error"
          ? saveError ?? "Save failed"
          : null;

  return (
    <div className="page">
      <div className="page-head">
        <h1>Inventory</h1>
        {statusLabel ? (
          <p className={`save-status save-status-${saveStatus}`}>{statusLabel}</p>
        ) : (
          <p className="muted save-hint">Click a cell to edit · Enter/blur saves · Esc cancels</p>
        )}
      </div>
      <div className="filters">
        <input
          type="search"
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={condition} onChange={(e) => setCondition(e.target.value)}>
          <option value="all">All conditions</option>
          {conditions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select value={phase} onChange={(e) => setPhase(e.target.value)}>
          <option value="all">All phases</option>
          {phases.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select value={build} onChange={(e) => setBuild(e.target.value)}>
          <option value="all">All builds</option>
          {builds.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>
      <p className="muted">
        Showing {filtered.length} of {parts.length} · Phase = current vs planned for that build ·
        click headers to sort
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key}>
                  <button
                    type="button"
                    className={`th-sort${sortKey === col.key ? " active" : ""}`}
                    onClick={() => onSort(col.key)}
                  >
                    {col.label}
                    {sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              return (
                <tr key={p.id}>
                  {COLUMNS.map((col) => {
                    if (col.key === "id") {
                      return (
                        <td key={col.key}>
                          <code>{p.id}</code>
                        </td>
                      );
                    }
                    const field = col.key as EditField;
                    const isEditing = editing?.id === p.id && editing.field === field;
                    return (
                      <td
                        key={col.key}
                        className={`editable${col.key === "notes" ? " notes" : ""}${isEditing ? " editing" : ""}`}
                        onClick={() => {
                          if (!isEditing) startEdit(p, field);
                        }}
                      >
                        {isEditing ? renderEditor(field) : renderDisplay(p, field)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
