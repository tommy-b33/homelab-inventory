# Deploy on LimeTower (Unraid)

LAN-only inventory UI at **`inventory.home`**, reached via Organizr → Nginx Proxy Manager → this container.

Do **not** port-forward this app to the internet (no auth; UI can write `parts.csv`).

## Prerequisites

- GitHub repo: https://github.com/tommy-b33/homelab-inventory
- Docker / Compose on Unraid
- Nginx Proxy Manager (or any reverse proxy)
- Local DNS that can resolve `*.home` (Pi-hole, AdGuard, router DNS, etc.)

## 1. Clone into appdata

```bash
git clone https://github.com/tommy-b33/homelab-inventory.git /mnt/user/appdata/homelab-inventory
cd /mnt/user/appdata/homelab-inventory
```

## 2. Start the container

```bash
docker compose up -d --build
```

Sanity check (bypass proxy):

```text
http://192.168.0.192:8787
```

(Use LimeTower’s LAN IP if different.)

## 3. Local DNS

Add an A record (or local DNS override):

| Name | Value |
|------|--------|
| `inventory.home` | LimeTower IP **or** the host running NPM (if NPM is the only entry) |

Usually point `inventory.home` at the **NPM host** (often LimeTower itself).

## 4. Nginx Proxy Manager

New **Proxy Host**:

| Field | Value |
|-------|--------|
| Domain names | `inventory.home` |
| Scheme | `http` |
| Forward hostname / IP | `192.168.0.192` (or Docker DNS name if on a shared proxy network) |
| Forward port | `8787` |
| Websocket support | off |
| Block common exploits | optional |
| SSL | optional LAN cert; skip WAN “Force SSL” if you only use HTTP on LAN |

Do **not** enable public/WAN access for this host.

## 5. Organizr

Add a tab/iframe pointing at:

```text
http://inventory.home
```

(or `https://inventory.home` if NPM terminates TLS on the LAN).

## Day-to-day updates

| Change | Action on LimeTower |
|--------|---------------------|
| UI / Docker code | `git pull` then `docker compose up -d --build` |
| `inventory/parts.csv` or `builds/*` from GitHub | `git pull` only (bind mounts; no rebuild) |
| Cell edit in the hosted UI | Writes appdata `parts.csv` immediately — **commit & push** from the Unraid clone (or copy back to Windows) so GitHub stays source of truth |

## Preferred edit loop

1. Edit on Windows → commit → `git push`
2. On LimeTower: `cd /mnt/user/appdata/homelab-inventory && git pull`
