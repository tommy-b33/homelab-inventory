# Inventory

## `parts.csv` columns

| Column | Description |
|--------|-------------|
| `id` | Stable unique key |
| `category` | `RAM` `CPU` `GPU` `MB` `CASE` `PSU` `FAN` `NIC` `HBA` `STORAGE` `COOLER` `OTHER` |
| `manufacturer` | Brand |
| `model` | Part / SKU |
| `key_specs` | Short summary |
| `qty` | Count |
| `condition` | `installed` `spare` `ordered` `planned` `dead` `sold` |
| `location` | Physical place (`knight` `limetower` `bin` `inbound` …) |
| `assigned_build` | Machine folder: `Knight` or `LimeTower` |
| `for_phase` | `current` = on the live machine today; `planned` = for that machine’s **PLAN** (may still sit elsewhere) |
| `notes` | Caveats |

## Machines

| `assigned_build` | OS | Function | Docs |
|------------------|-----|----------|------|
| `Knight` | Unraid Trial | LLM | Current = BUILD/LAYOUT/STATUS; target = PLAN |
| `LimeTower` | Unraid Pro | Media | Current = BUILD/LAYOUT/STATUS; target = PLAN |
| `TOMB-PC-2077` | Windows 11 Pro | Desktop | Current = BUILD/LAYOUT/STATUS |
| `CLAUDIA-PC` | Windows 10 Pro | Desktop | Current — Gigabyte 1660 SUPER |
| `CHRISTIAN-PC` | Windows (TBD) | Desktop | Retired C70 / FX-8350; 1660S → LimeTower |
| `DESKTOP-AITBP8B` | Windows (TBD) | Desktop | Christian daily — RX 6800; `192.168.0.85` |
| `TOMB-PC` | Windows (TBD) | Desktop | Retired — full PCPP list still assembled |
| `HTPC` | Windows (TBD) | Media | Retired Antec Fusion — verify internals |
| `ACEPC-AK1` | TBD | MiniPC | Retired — overheated; health unknown |

Example: ZhenLoong is `assigned_build=LimeTower` / `for_phase=planned` while `location=knight` (still housing Knight interim). LimeTower MB target is **X10DRi-T**; CLN4 is Knight interim only then spare/sell.

## `meta.json` phase

Build lifecycle: `current` | `planned` | `migrating` | `retired`  
(Part `for_phase` is separate: which config of that build the part belongs to.)
