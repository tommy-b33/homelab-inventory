# Homelab inventory

Local source of truth for **hardware inventory** and **build layouts**, plus a small **read-only web UI**.

## Layout

| Path | Purpose |
|------|---------|
| [`inventory/parts.csv`](inventory/parts.csv) | Every major part |
| [`builds/`](builds/) | One folder per **machine** (`Knight`, `LimeTower`, …) |
| [`builds/_template/`](builds/_template/) | Copy for a new PC |
| [`archive/`](archive/) | Historical plans |
| [`web/`](web/) | Vite + React browser UI |

## Naming

| Concept | Where it lives |
|---------|----------------|
| Machine name | Folder id (`Knight`, `LimeTower`) |
| OS / edition | `meta.json` + BUILD Identity |
| Function (LLM / Media) | `meta.json` + BUILD Identity |
| Lifecycle | `meta.json` `phase`: `current` \| `planned` \| `migrating` \| `retired` |

## Current vs planned

Same hostname folder. Do **not** create `LimeTower-planned`.

| Doc | Meaning |
|-----|---------|
| `BUILD.md` / `LAYOUT.md` / `STATUS.md` | **Current** running system |
| `PLAN.md` | **Proposed** target config + cutover checklist |

## Edit workflow

1. Update `inventory/parts.csv` (`assigned_build` = machine name)
2. Edit Markdown / `meta.json` under `builds/<Name>/`
3. Browse locally:

```bash
cd web
npm run dev
```

Open **http://localhost:5173**.

### Hosted on LimeTower (LAN)

See **[deploy/UNRAID.md](deploy/UNRAID.md)**: Docker on Unraid, **`inventory.home`** via SWAG, Organizr iframe. GitHub: https://github.com/tommy-b33/homelab-inventory

```bash
# on LimeTower
git clone https://github.com/tommy-b33/homelab-inventory.git /mnt/user/appdata/homelab-inventory
cd /mnt/user/appdata/homelab-inventory
docker compose up -d --build
```

Local preview of the production server:

```bash
cd web
npm run build && npm start
```

Open **http://localhost:8788**.

## Current builds

| Machine | OS | Function | Phase | Target (PLAN) |
|---------|-----|----------|-------|----------------|
| **[Knight](builds/Knight/)** | Unraid Trial | LLM | migrating | Define 7 XL + T4+ |
| **[LimeTower](builds/LimeTower/)** | Unraid Pro | Media | current | ZhenLoong + X10DRi-T ([NORCO archive](archive/LimeTower-NORCO-2026-09.md)) |
| **[TOMB-PC-2077](builds/TOMB-PC-2077/)** | Windows 11 Pro | Desktop | current | — |
| **[CHRISTIAN-PC](builds/CHRISTIAN-PC/)** | Windows (TBD) | Desktop | retired | 1660S → LimeTower |
| **[DESKTOP-AITBP8B](builds/DESKTOP-AITBP8B/)** | Windows (TBD) | Desktop | current | Christian daily; RX 6800; `.85` |
| **[TOMB-PC](builds/TOMB-PC/)** | Windows (TBD) | Desktop | retired | unused intact in corner |
| **[CLAUDIA-PC](builds/CLAUDIA-PC/)** | Windows 10 Pro | Desktop | current | 1660 SUPER done |
| **[HTPC](builds/HTPC/)** | Windows (TBD) | Media | retired | Antec Fusion; verify contents |
| **[ACEPC-AK1](builds/ACEPC-AK1/)** | TBD | MiniPC | retired | overheated — maybe dead |
