import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type BuildInfo = {
  id: string;
  name?: string;
  os?: string;
  osEdition?: string;
  function?: string;
  phase?: string;
};

export default function Builds() {
  const [builds, setBuilds] = useState<BuildInfo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/builds.json", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Failed to load builds.json (${res.status})`);
        return res.json();
      })
      .then(setBuilds)
      .catch((e: Error) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!builds.length) return <p className="muted">Loading builds…</p>;

  return (
    <div className="page">
      <h1>Builds</h1>
      <ul className="build-list">
        {builds.map((b) => {
          const osLabel = [b.os, b.osEdition].filter(Boolean).join(" ");
          return (
            <li key={b.id}>
              <Link to={`/builds/${b.id}`}>
                <strong>{b.name ?? b.id}</strong>
              </Link>
              <div className="build-meta">
                {b.function && <span className="pill">{b.function}</span>}
                {b.phase && (
                  <span className={`pill pill-phase-${b.phase}`}>{b.phase}</span>
                )}
                {osLabel && <span className="muted">OS: {osLabel}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
