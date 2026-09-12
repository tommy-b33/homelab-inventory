# Plan — LimeTower (forward)

**Phase:** current platform locked; capacity / polish next  
**Last updated:** 2026-09-11  
**Current hardware:** see **BUILD.md** · **LAYOUT.md**  
**NORCO archive:** [archive/LimeTower-NORCO-2026-09.md](../../archive/LimeTower-NORCO-2026-09.md)

Cutover to ZhenLoong + X10DRi-T is **done**. Remaining work is drive adds/replacements and polish.

## Capacity / parity (5× HC520 12TB) — **locked**

SKU: **HGST Ultrastar DC HC520** `HUH721212ALE601` (`disk-lt-hc520-12tb`) — **refurbished** lot (expect high POH; SMART-check before assign).

| Step | Action | Status |
|------|--------|--------|
| 1 | Cut over 4TB array + Pro USB | **Done** 2026-09-07 |
| 2 | **12TB → Parity** (replace dead `K7GL6KKL`) | **Failed** — `8HK5R4EH` disabled 2026-09-09 (realloc 21 / pending 8 / POH 31795); RMA |
| 3 | **12TB → Parity 2** (`8HKZKWDH`) | **Done** 2026-09-09 (~20h, 0 errors) |
| 4 | **Replacement 12TB → Parity** (`8DJJZLUY`) | **Done** 2026-09-10 (~20h, 0 errors) |
| 5 | **3× 12TB → data** | **Partial** — Disk 8 `8HK38K6H` in (2026-09-11); `8HH6P98H` pending SMART; need more |

## Optional later

| Item | Notes |
|------|--------|
| RAM → 192 / 256 GB | Matching **RC1** only |
| NVIDIA driver | 1660 NVENC for Plex |
| Fan curves | BMC Heavy IO / Unraid HDD-temp script |
| Disks on **9305** | When filling more of 24 bays |
| 10G switch | Still unboxed |
| Cache upgrade | Optional; keep SX850 for now |
| Inventory UI on LimeTower | Docker @ `inventory.home` — see `deploy/UNRAID.md` |

## PCIe (reference)

| Card | Slot |
|------|------|
| LSI 9305-16i | Slot1 |
| GTX 1660 SUPER | Slot4 |
| Leave Slot2/3/5 empty | Clearance |

**AOC-STG-i2T:** not used (onboard X540). Spare/sell.

## Wiring (24 bays)

| Path | Role |
|------|------|
| 9305-16i → 8643→8087 | Up to **16** backplane bays |
| Onboard SATA → reverse breakout | Up to **8** more |
| Today | All current array disks on **onboard SATA** |
