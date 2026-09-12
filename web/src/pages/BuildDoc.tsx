import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { loadBuildMarkdown } from "../lib/data";

const DOCS = ["BUILD", "LAYOUT", "STATUS", "PLAN"] as const;

export default function BuildDoc() {
  const { id = "", doc: docParam } = useParams();
  const raw = (docParam ?? "BUILD").toUpperCase();
  const doc = (DOCS.includes(raw as (typeof DOCS)[number])
    ? raw
    : "BUILD") as (typeof DOCS)[number];
  const [md, setMd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) return;
    setError(null);
    setMissing(false);
    setMd("");
    loadBuildMarkdown(id, doc)
      .then((text) => {
        setMd(text);
        setMissing(false);
      })
      .catch((e: Error) => {
        if (doc === "PLAN" && /404|Failed to load/i.test(e.message)) {
          setMissing(true);
          setError(null);
        } else {
          setError(e.message);
        }
      });
  }, [id, doc]);

  return (
    <div className="page">
      <p className="crumb">
        <Link to="/builds">Builds</Link> / <code>{id}</code>
      </p>
      <div className="tabs">
        {DOCS.map((d) => (
          <Link
            key={d}
            className={d === doc ? "tab active" : "tab"}
            to={`/builds/${id}/${d}`}
          >
            {d}
          </Link>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      {missing && (
        <p className="muted">
          No <code>PLAN.md</code> yet for this build. Add one under{" "}
          <code>builds/{id}/PLAN.md</code> to document the proposed configuration.
        </p>
      )}
      {!error && !missing && !md && <p className="muted">Loading…</p>}
      {md && (
        <article className="prose">
          <Markdown remarkPlugins={[remarkGfm]}>{md}</Markdown>
        </article>
      )}
    </div>
  );
}
