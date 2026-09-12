# Knight (current)

**Status:** online  
**Last updated:** 2026-09-05  
**Phase:** current reality (see **PLAN** for Define 7 XL + T4+ target)

## Identity

| Field | Value |
|-------|-------|
| Hostname / build id | `Knight` |
| OS | Unraid (**Trial**) |
| Primary function | **LLM** inference (Docker + NVIDIA) |
| LAN | `192.168.0.77` |
| BMC | ~`192.168.0.86` |

## Role

Trial Unraid **LLM** bring-up box. Currently on **X10DRH-CLN4** inside **ZhenLoong** (interim).

## Hardware (as running now)

| Component | Detail | Notes |
|-----------|--------|--------|
| Case | ZhenLoong 4U 24-bay | Interim — poor P40 cooling |
| Motherboard | **X10DRH-CLN4** | Interim only; LimeTower locked to **X10DRi-T** (CLN4 → spare/sell) |
| CPUs | 2× E5-2698 v4 | |
| Coolers | 2× NH-U9DX i4 | |
| RAM | Kingston 16 GB ECC RDIMM mix | RC1 + RC2 mixed — clean up |
| GPUs | 2× Tesla P40 | Thermals fail under sustained load here |
| Cache | Duo + 2× Kioxia KXG70PNV2T04 2 TB | btrfs raid0 ~4.1 TB |
| PSU | EVGA SuperNOVA 1300 G2 | Complete cable set; LimeTower has its own refurb G2 inbound |
| Boot | SanDisk 30.8 GB | Unraid **Trial** |

## Software (current)

| Layer | Choice | Notes |
|-------|--------|--------|
| OS | Unraid Trial | Docker on; NVIDIA driver **580.x** |
| Cache pool | `cache` btrfs raid0 | appdata / system |
| GPU path | Docker + nvidia-smi | Validated; long burns unsafe in this case |

## Open items (current)

- [ ] Avoid sustained dual-P40 load until PLAN chassis/shrouds  
- [ ] RAM RC cleanup when convenient  
