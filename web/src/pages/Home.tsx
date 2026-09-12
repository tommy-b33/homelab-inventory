import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="page">
      <h1>Homelab inventory</h1>
      <p className="lede">
        Browse hardware parts and machine build docs. Source of truth is CSV + Markdown in the
        repo; this UI is read-only.
      </p>
      <div className="cards">
        <Link className="card" to="/inventory">
          <h2>Inventory</h2>
          <p>Filterable table of major components from parts.csv.</p>
        </Link>
        <Link className="card" to="/builds">
          <h2>Builds</h2>
          <p>Knight Unraid, LLM Define 7 XL / T4+, and future machines.</p>
        </Link>
      </div>
    </div>
  );
}
