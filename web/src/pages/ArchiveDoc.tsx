import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { loadArchiveMarkdown } from "../lib/data";

export default function ArchiveDoc() {
  const { file = "" } = useParams();
  const [md, setMd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;
    setError(null);
    setMd("");
    loadArchiveMarkdown(file)
      .then((text) => {
        setMd(text);
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }, [file]);

  return (
    <div className="page">
      <p className="crumb">
        <Link to="/builds">Builds</Link> / archive / <code>{file}</code>
      </p>
      {error && <p className="error">{error}</p>}
      {!error && !md && <p className="muted">Loading…</p>}
      {md && (
        <article className="prose">
          <Markdown remarkPlugins={[remarkGfm]}>{md}</Markdown>
        </article>
      )}
    </div>
  );
}
