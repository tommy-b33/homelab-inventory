export type Part = {
  id: string;
  category: string;
  manufacturer: string;
  model: string;
  key_specs: string;
  qty: string;
  condition: string;
  location: string;
  assigned_build: string;
  for_phase: string;
  notes: string;
};

export async function loadParts(): Promise<Part[]> {
  const Papa = (await import("papaparse")).default;
  const res = await fetch("/data/parts.csv", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load parts.csv (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<Part>(text, { header: true, skipEmptyLines: true });
  if (parsed.errors.length) {
    console.warn(parsed.errors);
  }
  return parsed.data.filter((r) => r.id);
}

export async function saveParts(parts: Part[]): Promise<void> {
  const res = await fetch("/api/parts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parts }),
  });
  if (!res.ok) {
    let message = `Failed to save parts (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) message = body.error;
    } catch {
      /* ignore */
    }
    if (res.status === 404) {
      message =
        "Save API unavailable — run the UI with `npm run dev` (not a static preview or file://).";
    }
    throw new Error(message);
  }
}

export async function loadBuildMarkdown(id: string, doc: string): Promise<string> {
  const file = doc.toUpperCase().endsWith(".MD") ? doc : `${doc}.md`;
  const res = await fetch(
    `/data/builds/${encodeURIComponent(id)}/${encodeURIComponent(file)}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`Failed to load ${id}/${file} (${res.status})`);
  return res.text();
}

export async function loadArchiveMarkdown(file: string): Promise<string> {
  const name = file.toLowerCase().endsWith(".md") ? file : `${file}.md`;
  const res = await fetch(`/data/archive/${encodeURIComponent(name)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load archive/${name} (${res.status})`);
  return res.text();
}
