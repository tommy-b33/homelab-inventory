# LimeTower — NORCO era (ARCHIVED)

**Archived:** 2026-09-07  
**Superseded by:** `builds/LimeTower/` (ZhenLoong + X10DRi-T cutover)  
**Note:** Snapshot of production LimeTower **before** chassis/motherboard move. Kept for posterity.

---

# LimeTower (NORCO) — as of 2026-09-06

**Status:** was online — **Parity disabled** (`K7GL6KKL`); array nearly full  
**Phase:** retired / vacated  
**Cutover:** 2026-09-07 → ZhenLoong + X10DRi-T

## Identity

| Field | Value |
|-------|-------|
| Hostname / build id | `LimeTower` |
| OS | Unraid **Pro** (flash moved intact) |
| Primary function | **Media** / NAS |
| LAN | `192.168.0.192` (`bond0`) |

## Role

Production **media server** and file NAS in **NORCO RPC-4308**. Heavy Docker stack (Plex, *arr, game servers, etc.).

## Hardware (final NORCO config)

| Component | Detail | Notes |
|-----------|--------|--------|
| Case | **NORCO RPC-4308** | 4U short-depth; **8** hot-swap trays |
| Motherboard | **ASUS Z8PE-D12 / Z8PN-E-D12(X)** Rev 1.0x | BIOS AMI **1401** (2012-04-25); dual LGA1366 |
| CPUs | **2× Xeon E5520** @ 2.27 GHz | 8C/16T total |
| RAM | **96 GB** DDR3 multi-bit ECC | Not usable on X10DRi-T |
| Storage HBA | **LSI SAS2008** Falcon (9211-8i class) | Drove Unraid array |
| Array | 2× HGST 4 TB parity + 6× 4 TB data | See serial map below |
| Capacity | ~24 TB raw | **~23.8 TB / ~162 GB free** at cutover |
| Cache | ADATA **SX850** 256 GB | S/N `2H4220014093`; btrfs |
| Boot | SanDisk Cruzer Fit 15.4 GB | Unraid **Pro** — moved to new box |

## Unraid array map (serials at cutover)

| Unraid slot | Serial | Model | Notes |
|-------------|--------|-------|--------|
| **Parity** | **K7GL6KKL** | HGST HDN726040ALE614 | Disabled / SMART red |
| **Parity 2** | **K3H14A7B** | HGST HDN726040ALE614 | OK |
| **Disk 1** | **K7GDZ8UL** | HGST HDN726040ALE614 | xfs |
| **Disk 2** | **K7GBUV7B** | HGST HDN726040ALE614 | xfs |
| **Disk 3** | **WS23WDTE** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 4** | **WS23WH18** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 5** | **WS23WF05** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 6** | **K3H1NK2B** | HGST HDN726040ALE614 | xfs |
| **Cache** | **2H4220014093** | ADATA SX850 256 GB | btrfs |
| **Flash** | — | SanDisk Cruzer Fit 15.4 GB | Pro |

## Known issues at end of life

- Parity1 SMART / disabled — array on Parity 2 only  
- Array ~99% full  
- HDD temps often **40 °C+** with alerts (vs ~32 °C post-cutover)  
- Loud / limited cooling vs ZhenLoong mid-wall  

## Fate after cutover

| Item | Disposition |
|------|-------------|
| NORCO RPC-4308 | spare/sell |
| Z8PE-D12 + 2× E5520 + 96 GB DDR3 | spare/sell |
| SAS2008 HBA | spare/sell |
| Array disks + cache + Pro flash | moved to ZhenLoong |
| `K7GL6KKL` | retired after 12TB Parity replace (2026-09-07) |
