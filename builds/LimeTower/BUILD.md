# LimeTower (current)

**Status:** online — production  
**Last updated:** 2026-09-07  
**Phase:** current  
**Prior platform:** [archive/LimeTower-NORCO-2026-09.md](../../archive/LimeTower-NORCO-2026-09.md)

## Identity

| Field | Value |
|-------|-------|
| Hostname / build id | `LimeTower` |
| OS | Unraid **Pro** |
| Primary function | **Media** / NAS |
| LAN | `192.168.0.192` (`bond0`) |
| IPMI | `192.168.0.78` |

## Role

Production **media server** and file NAS. Docker stack (Plex, *arr, game servers, etc.). Cut over from NORCO **2026-09-07**.

## Hardware (as running now)

| Component | Detail | Notes |
|-----------|--------|--------|
| Case | **ZhenLoong 4U 24-bay** | Mid-wall cooling; HDD temps ~32 °C under parity sync |
| Motherboard | **Supermicro X10DRi-T** | BIOS **3.4a**; dual 10G X540; narrow ILM |
| CPUs | **2× E5-2690 v4** | 14C/28T each |
| Coolers | **2× Noctua NH-U9DX i4** | Narrow ILM |
| RAM | **128 GB** DDR4-2400 ECC RDIMM RC1 | 8×16 GB Kingston `KVR24R17S4/16I`; 4+4 in `*1` slots |
| PSU | **EVGA SuperNOVA 1300 G2** | Molex disk wall + 1660 PCIe |
| HBA | **LSI 9305-16i** | Slot1; ready for bay expansion (array on onboard SATA for now) |
| GPU | **ASUS GTX 1660 SUPER** | Slot4; NVENC (NVIDIA driver TBD) |
| Mid fans | **3× ARCTIC P12 Pro PST** | FANA / FANB / FAN4 (direct to MB) |
| Rear fans | **2× Noctua NF-A8** | FAN3 Y-splitter |
| Boot | SanDisk Cruzer Fit 15.4 GB | Unraid **Pro** |
| Cache | ADATA **SX850** 256 GB | S/N `2H4220014093`; btrfs |
| Array | See **LAYOUT** | Capacity growth via HC520 12TB plan |

## Software

| Layer | Choice | Notes |
|-------|--------|--------|
| OS | Unraid Pro | Same flash as NORCO era |
| Array | Dual parity (**valid**) | Parity `8DJJZLUY` + P2 `8HKZKWDH` (both 12TB) |
| Docker | Large stack | plex, sonarr, radarr, sab, games, etc. |
| VMs | None | |

## Open items (ongoing)

- [x] NVIDIA driver + Plex HW transcode (1660, 2026-09-08)  
- [x] Dual parity valid — P2 `8HKZKWDH` + Parity `8DJJZLUY` (2026-09-10); then **3× 12TB data** (**locked**)  

- [ ] Fan curve tune  
- [ ] Optional: move disks onto **9305**; 10G switch when ready  
- [ ] Host **homelab-inventory** UI here  
- [ ] Spare/sell NORCO platform leftovers  
