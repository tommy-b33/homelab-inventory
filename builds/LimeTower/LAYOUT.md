# Layout — LimeTower (ZhenLoong + X10DRi-T)

**Last updated:** 2026-09-11

## Network

| Interface | Address | Notes |
|-----------|---------|--------|
| LAN | `192.168.0.192` | `bond0` active-backup; **eth0/eth1 @ 1000 Mbps** |
| IPMI | `192.168.0.78` | Dedicated BMC |

## Chassis

**ZhenLoong 4U 24-bay** — production.

## Motherboard / HBA / GPU

**X10DRi-T** + **2× E5-2690 v4** + **128 GB** RC1.  
**9305-16i** Slot1 (present; array on **onboard SATA** for now).  
**1660 SUPER** Slot4.

## Unraid array map (by serial)

| Unraid slot | Serial | Model | Notes |
|-------------|--------|-------|--------|
| **Parity** | **8DJJZLUY** | HUH721212ALE601 | 12TB; rebuild **complete** 2026-09-10 (~20h, 0 errors) |
| **Parity 2** | **8HKZKWDH** | HUH721212ALE601 | 12TB; sync **complete** 2026-09-09 (~20h, 0 errors) |
| **Disk 1** | **K7GDZ8UL** | HGST HDN726040ALE614 | xfs |
| **Disk 2** | **K7GBUV7B** | HGST HDN726040ALE614 | xfs |
| **Disk 3** | **WS23WDTE** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 4** | **WS23WH18** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 5** | **WS23WF05** | Seagate ST4000NE001-2MA101 | xfs |
| **Disk 7** | **K3H14A7B** | HGST HDN726040ALE614 | xfs; ex-Parity 2; added 2026-09-11 |
| **Disk 8** | **8HK38K6H** | HUH721212ALE601 | xfs; 12TB; added 2026-09-11 |
| **Cache** | **2H4220014093** | ADATA **SX850** 256 GB | btrfs |
| **Flash** | — | SanDisk Cruzer Fit 15.4 GB | Unraid Pro |

**Retired / failed:**
- Parity `K7GL6KKL` (4TB SMART) — bin  
- Parity `8HK5R4EH` (12TB HC520) — **RMA RA93506** (goHardDrive)  

**Unassigned:** `8HH6P98H` (12TB) — long SMART / data candidate; UNC history  

Assign by **serial**, never by `/dev/sdX`.

**Locked growth:** more 12TB data as clean drives arrive (need ~1 more for original 3× plan).

## Vacated

See [archive/LimeTower-NORCO-2026-09.md](../../archive/LimeTower-NORCO-2026-09.md).
