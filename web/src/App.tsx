import { NavLink, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Builds from "./pages/Builds";
import BuildDoc from "./pages/BuildDoc";
import ArchiveDoc from "./pages/ArchiveDoc";

export default function App() {
  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <NavLink to="/">Homelab inventory</NavLink>
        </div>
        <nav>
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : undefined)}>
            Home
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Inventory
          </NavLink>
          <NavLink
            to="/builds"
            className={({ isActive }) => (isActive ? "active" : undefined)}
          >
            Builds
          </NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/builds" element={<Builds />} />
          <Route path="/builds/:id" element={<BuildDoc />} />
          <Route path="/builds/:id/:doc" element={<BuildDoc />} />
          <Route path="/archive/:file" element={<ArchiveDoc />} />
        </Routes>
      </main>
      <footer className="foot">
        Read-only UI · edit <code>inventory/parts.csv</code> and{" "}
        <code>builds/*/…md</code> in the repo
      </footer>
    </div>
  );
}
