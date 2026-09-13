# Plan — Knight → Define 7 XL + T4+

**Phase:** planned / proposed  
**Last updated:** 2026-09-12

Proposed end state for the LLM machine.

## Planned identity

| Field | Value |
|-------|-------|
| Hostname | `Knight` |
| OS | Unraid **Trial** (same USB unless upgraded later) |
| Function | **LLM** |
| LAN | Keep `192.168.0.77` if possible |
| BMC | New address on T4+ IPMI |

## Planned hardware

| Component | Detail | Notes |
|-----------|--------|--------|
| Case | **Fractal Define 7 XL** (`FD-C-DEF7X-*`) | Ordered; **open layout** |
| Motherboard | **X10DRi-T4+** | 24 DIMM; **quad 10G**; **square ILM** |
| CPUs | 2× E5-2698 v4 | Move from current |
| Coolers | **2× Dynatron R17** (square ILM) | Matches T4+; Noctuas go to LimeTower / X10DRi-T |
| RAM | Matched ECC RDIMM | Prefer one RC family; grow toward 256 GB+; **LimeTower buys its own** 128 GB kit (no share) |
| GPUs | 2× Tesla P40 | PCIe **x16** each; **dual 5015 shrouds** |
| Cache (appdata) | **SanDisk SDSSDX-240G** 240 GB | Separate pool for `appdata` / system / Docker configs |
| Cache (LLM) | **Dell Ultra-Speed Duo** + 2× Kioxia 2 TB | Separate pool for model weights / LLM scratch |
| PSU | EVGA SuperNOVA 1300 G2 | Keep complete/healthy unit; LimeTower gets separate refurb G2 |
| Boot | Trial USB | |
| NIC (add-in) | — | **AOC-STG-i2T** not needed (quad onboard 10G) |
| Bulk / library | **LimeTower over 10G** | No local HDD array on Knight |

## Storage pools (Unraid)

| Pool | Device(s) | Shares / role | Notes |
|------|-----------|---------------|--------|
| **`appdata`** (name TBD) | SanDisk **240 GB** SATA SSD | `appdata`, system, Docker metadata | Slow/small is fine; keeps configs off NVMe |
| **`models`** / **`llm`** | Duo + **2× Kioxia KXG70PNV2T04** | Model weights, LLM scratch | Prefer **raid0** for speed/space, or **raid1** for redundancy |
| Boot | Unraid USB | OS | |
| — | — | Media / cold models | Stay on **LimeTower**; pull over **10G** |

Do **not** mix the 240 GB into the Kioxia pool (it becomes the bottleneck).

## PCIe slot budget (X10DRi-T4+)

| Priority | Card | Width | Notes |
|----------|------|-------|-------|
| 1–2 | **Tesla P40** ×2 | x16 each | LLM compute; shrouds required |
| 3 | **Dell Ultra-Speed Duo** | x8 or x16 | Dual M.2; enable **x8/x8 bifurcation** on that slot |
| — | AOC-STG-i2T | — | Skip — onboard quad 10G covers LAN |

Define 7 XL / C70 has room; keep Duo on a bifurcating CPU slot so both Kioxias stay visible. SanDisk 240 GB on onboard SATA.

## Planned cooling

- Front intake → P40 fin inlets  
- On-card radial shrouds (PETG print / buy — not PLA next to hot fins)  
- High fan curve or `nvidia-smi`-driven script (BMC ignores GPU temp)  

## Cutover checklist

1. Receive Define 7 XL; verify SKU `FD-C-DEF7X`  
2. Mount **T4+** + CPUs + **R17 square ILM coolers** + RAM in XL  
3. Install **2× P40** + **Duo** (bifurcation) + PSU; fit shrouds  
4. Move trial USB / restore Docker paths on cache  
5. Confirm `nvidia-smi` + both NVMe + short load; then sustained with kill command ready  
6. Move **Noctua narrow ILM** coolers + release **ZhenLoong** to LimeTower (**X10DRi-T**); park **CLN4** as spare/sell  
7. Set `meta.json` `phase` → `current` when stable  

## Open items

- [ ] Define 7 XL **or** C70 mount mod (T4+ standoffs)  
- [ ] P40 shrouds  
- [ ] Confirm T4+ slot + BIOS **bifurcation** for Duo (both Kioxia)  
- [ ] Two-pool storage: SanDisk 240 GB → appdata; Kioxias → LLM  
- [ ] Matched RAM purchase / RC split  
- [ ] Primary LLM stack (Ollama / vLLM / llama.cpp)  
- [ ] 10G to LimeTower for model library  
