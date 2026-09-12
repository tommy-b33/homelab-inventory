# Layout — Knight (current)

## Network

| Interface | Address | Notes |
|-----------|---------|--------|
| LAN | `192.168.0.77` | |
| BMC | ~`192.168.0.86` | On CLN4 |

## Chassis (now)

**ZhenLoong 4U** + **X10DRH-CLN4** (interim).

## PCIe / devices (now)

| Device | Notes |
|--------|--------|
| Tesla P40 ×2 | Installed; cooling inadequate for LLM burn |
| Dell Ultra-Speed Duo | Both Kioxia online |
| Trial USB | Boot |

## Storage (now)

| Device | Role |
|--------|------|
| Trial SanDisk USB | Unraid boot |
| 2× Kioxia raid0 | Docker / appdata / models |

## Fans (now)

Mid wall + **2× Noctua NF-A8** rear (stay with ZhenLoong → LimeTower). Ad-hoc GPU duct — **not** sufficient for P40 load. BMC does not ramp on GPU temp.
