# Homelab Server Build — Parts & Software Plan (ARCHIVED)

**Archived:** 2026-09-05  
**Source:** `c:\Users\tomb\Server\BUILD.md`  
**Note:** Historical **single-box** NAS+LLM plan (May 2026). Superseded by split builds in `builds/knight-unraid` and `builds/llm-t4-define7xl`. Motherboard names in this file may not match final Knight (**X10DRH-CLN4**) hardware.

---

# Homelab Server Build — Parts & Software Plan

**Last updated:** 2026-05-28  
**Role:** Unraid NAS (24-bay storage) + local LLM inference (Docker)  
**Status:** Build in progress — awaiting **2× Noctua NH-U9DX i4** for CPU cooling before first full POST.

---

## Chassis & backplane

| Component | Detail | Notes |
|-----------|--------|--------|
| **Case** | ZhenLoong 4U 24-bay rackmount (19") | Hot-swap bays; **6 Gb/s** SAS/SATA backplane |
| **Motherboard fit** | **12″ × 13″** max (narrow/E-ATX class) | **X10DRi-T4+ did not fit** — swapped to X10DRi-T |
| **Fan wall** | **3× 120×38 mm** | Headers: **FANA, FANB, FAN4** |
| **Rear exhaust** | **2× 80 mm** | **FAN3** via **4-pin PWM Y-splitter** (planned) |
| **Power** | Dedicated **20 A** circuit | **EVGA SuperNOVA 1300 G2** (1300 W) |

---

## Motherboard & CPUs

| Component | Detail | Notes |
|-----------|--------|--------|
| **Motherboard** | **Supermicro X10DRi-T** | Dual **LGA2011-3**; **narrow ILM**; **16× DDR4**; **IPMI**; dual **10 GbE** (X540) |
| **CPUs** | **2× Intel Xeon E5-2699 v4** | 22C/44T each; **145 W TDP**; needs **BIOS 2.0+** for v4 |
| **Thermal interface** | **Honeywell PTM7950** (phase-change pads) | On CPU IHS before Noctua install |

---

## Memory

| Component | Detail | Notes |
|-----------|--------|--------|
| **Existing** | **12× Kingston 16 GB** DDR4 ECC **RDIMM**, **1Rx4**, **PC4-2400** | e.g. **KVR24R17S4/16I** |
| **Added** | **4× Kingston 16 GB** **KSM24RS4/16MEI** (same spec class) | **256 GB** total when all 16 slots filled |
| **Population (12 DIMMs)** | **CPU1:** A1, B1, C1, D1, A2, B2 — **CPU2:** E1, F1, G1, H1, E2, F2 | Empty: C2, D2, G2, H2 |
| **Population (16 DIMMs)** | All **×1** slots, then **×2** on A/B and E/F channels | See Supermicro **MNL-1491** |
| **Speed expectation** | May train **≤2133 MT/s** with 6+ DIMMs per CPU (2DPC on some channels) | Normal for this platform |

---

## Cooling

| Component | Detail | Status |
|-----------|--------|--------|
| **CPU coolers** | **2× Noctua NH-U9DX i4** | **Ordered** (QuietPC USA, ~$150 shipped) — **narrow ILM** brackets in box |
| **Rejected** | **2× Dynatron R17** | **Square ILM only** — does not fit X10DRi-T |
| **Per cooler** | **2× NF-B9 PWM** (push/pull) | **4 CPU fan headers** required |

### Fan header plan

| Header | Device |
|--------|--------|
| **FAN1 + FAN2** | **CPU1** Noctua (both fans) |
| **Fan5 + Fan6** | **CPU2** Noctua (both fans) — free by moving rear 80s |
| **FANA + FANB + FAN4** | **3× 120×38** fan wall (GPU / intake plenum) |
| **FAN3** | **2× 80 mm** rear exhaust (**PWM Y-splitter**) |
| **FAN2 / FAN3** | Spare until coolers installed; **FAN2** used by CPU1 second fan |

### GPU cooling (planned)

- **P40s** in physical slots **3 & 5** (x16); **slot 1** blocked for P40 by **RAM** clearance.
- **~2.75″** gap: card tail → fan wall (inlet side).
- **Planned:** sealed **shared plenum** from **all 3× 120 mm** → split to **both P40 fin inlets**; block bypass paths.
- **Optional later:** exhaust collectors / pull on **P40 outlet** face (ducted), not case-only exhaust.
- Both cards currently align with **rightmost 120 mm** — duct as **one plenum**, not one-fan-per-GPU.

---

## Storage hardware

| Component | Detail | Notes |
|-----------|--------|--------|
| **HBA** | **LSI 9305-16i** (IT mode) | Up to **16 drives**; **PCIe x8** |
| **HBA cabling** | **4× SFF-8643 → SFF-8087** | To **6 Gb/s** backplane |
| **Onboard SATA** | **10× SATA3** on X10DRi-T | **2× reverse breakout** (SATA → 8087) for **8 drives** |
| **Target topology** | **16 (HBA) + 8 (onboard)** = **24 bays** | Confirm backplane port zoning / expander layout |
| **Cache / boot NVMe** | **Kioxia XG8 2 TB** in **Dell Ultra-Speed Duo** adapter | **BIOS bifurcation x8/x8** on host slot if using both NVMe devices |

---

## PCIe layout (physical slots — user numbering)

| Slot | Electrical (board silkscreen) | Installed / planned |
|------|-------------------------------|---------------------|
| **1** | x16 length (CPU1) | **LSI 9305-16i** ✓ |
| **2** | x8 (CPU1) | **Dell Ultra-Speed Duo** (NVMe) ✓ |
| **3** | x16 (CPU2) | **Tesla P40 #1** |
| **4** | x8 | Blocked by P40 #1 (dual-slot) |
| **5** | x16 (CPU2) | **Tesla P40 #2** |
| **6** | x8 | Blocked by P40 #2 (dual-slot) |

**Clearance verified:** HBA + Dell adapter **do not interfere with RAM**.

**BIOS (when powering on):** Enable **PCIe bifurcation** on the slot holding the **Duo** adapter if required for 2× NVMe.

---

## GPUs

| Component | Detail | Notes |
|-----------|--------|--------|
| **GPUs** | **2× NVIDIA Tesla P40** | **24 GB** VRAM each; **passive**; **Pascal** (no Tensor Cores) |
| **Use** | Unraid **Docker** LLM (NVIDIA driver plugin path) | Not relying on VM passthrough by default |
| **Cooling** | Chassis **fan wall + ducting** (see above) | Monitor for throttle / **Xid** under sustained load |

---

## Power budget (rough)

| Load | Approx. |
|------|---------|
| **CPUs** (2× 145 W TDP) | ~290 W class under full CPU |
| **GPUs** (2× ~250 W TDP class) | ~500 W class under full GPU |
| **Disks + fans + rest** | ~100–250+ W |
| **PSU** | **1300 W** — adequate with margin for spin-up, not oversized |

---

## Software plan

| Layer | Choice | Notes |
|-------|--------|--------|
| **Hypervisor / OS** | **Unraid** (bare metal) | Single OS owns the array |
| **Storage** | **Unraid array** + parity (strategy TBD) | **IT-mode HBA** + onboard SATA paths |
| **Cache / app data** | **NVMe pool** (Kioxia on Duo adapter) | Docker / VM disks; mover as needed |
| **LLM runtime** | **Docker** on Unraid | Community **NVIDIA driver** + container toolkit workflow |
| **Primary LLM stack** | *TBD* — e.g. **Ollama** or API-style (**vLLM** / **llama.cpp server**) | Pick after hardware is stable |
| **Management** | **IPMI/BMC** on X10DRi-T | BIOS updates, fan curves, remote power |
| **Remote access** | **10 GbE** (dual onboard) + dedicated **IPMI LAN** | |

### Software checklist (post-hardware)

- [ ] BIOS/IPMI: **v4 CPU** support, **Above 4G Decoding** / MMIO if needed for GPUs  
- [ ] **PCIe bifurcation** for NVMe Duo slot  
- [ ] **Fan curves** — CPU headers vs **FANA/B/4** under GPU load  
- [ ] Install Unraid; confirm **HBA** and **all array drives** visible  
- [ ] NVIDIA plugin; verify **`nvidia-smi`** in Docker; set **`CUDA_VISIBLE_DEVICES`** if using one GPU  
- [ ] Validate thermals: CPU + GPU + parity check / heavy I/O overlap  

---

## Known weak spots / risks

1. **P40 thermals** in storage-first 4U — ducting critical.  
2. **P40 inference** vs modern GPUs — quantization / smaller models.  
3. **Combined CPU+GPU+disk** load on **1300 W** and cooling.  
4. **Unraid + Tesla** — more setup friction than consumer GeForce.  
5. **Single machine** — NAS maintenance vs LLM contention.  
6. **Dell Duo bifurcation** — verify early in BIOS.  

---

## Build order (remaining)

1. Receive and install **2× NH-U9DX i4** (narrow ILM bars, **FAN1+2** / **Fan5+6**).  
2. Complete **RAM** population (12 or 16 sticks per plan).  
3. **First POST** — IPMI/BIOS: CPUs, RAM total, temps.  
4. Cable **HBA** + **onboard SATA→8087** to backplane (label ports).  
5. Install **P40s**; build **fan-wall plenum** / GPU ducts.  
6. Install **NVMe**; configure **bifurcation**.  
7. Install **Unraid**; storage + NVIDIA Docker stack.  

---

## Parts not used / spare

| Item | Reason |
|------|--------|
| **Supermicro X10DRi-T4+** | Chassis too small (EE-ATX depth) |
| **2× Dynatron R17** | Square ILM — wrong for this board |

---

## Open / TBD (fill in as decided)

- [ ] **Unraid parity scheme** (disk count, parity slots, spin-up delay)  
- [ ] **Primary LLM app** (Ollama vs API server) and **target model sizes**  
- [ ] **Exact backplane model** / expander vs direct-attach confirmation  
- [ ] **16 vs 12 DIMMs** final (256 GB vs 192 GB)  
- [ ] **GPU duct** materials and photos for final layout  

---

## Reference links

- [Supermicro X10DRi-T product page](https://www.supermicro.com/en/products/motherboard/X10DRI-T)  
- [Motherboard manual MNL-1491](https://www.supermicro.com/manuals/motherboard/C606_602/MNL-1491.pdf)  
- [Supermicro FAQ — X10DRi narrow ILM heatsink](https://www.supermicro.com/support/faqs/faq.cfm?faq=26288)  
- [Noctua NH-U9DX i4](https://www.noctua.at/en/nh-u9dx-i4)  

---

*Archived single-box plan. See active builds under `/builds`.*
