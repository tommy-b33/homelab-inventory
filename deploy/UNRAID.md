# Deploy on LimeTower (Unraid)

LAN-only inventory UI at **`inventory.home`**, reached via Organizr → **SWAG** → this container.

Do **not** port-forward this app to the internet (no auth; UI can write `parts.csv`).

## Prerequisites

- GitHub repo: https://github.com/tommy-b33/homelab-inventory
- Docker / Compose on Unraid
- **SWAG** (linuxserver) — already on LimeTower (`192.168.0.192:180` / `:1443`)
- **Organizr** (`organizrv2` on `:8081`)
- Local DNS that can resolve `inventory.home` (Pi-hole, AdGuard, router DNS, etc.)

## 1. Clone into appdata

```bash
git clone https://github.com/tommy-b33/homelab-inventory.git /mnt/user/appdata/homelab-inventory
cd /mnt/user/appdata/homelab-inventory
```

## 2. Start the container

Host port **8787** (free on LimeTower). Spekarr uses host **8788** (maps container 8787→8788).

```bash
docker compose up -d --build
```

Sanity check (bypass proxy):

```text
http://192.168.0.192:8787
```

## 3. Local DNS

| Name | Value |
|------|--------|
| `inventory.home` | `192.168.0.192` (LimeTower / SWAG) |

## 4. SWAG proxy config

Create (or drop in) a site config under SWAG’s nginx proxy-confs, e.g.  
`/mnt/user/appdata/swag/nginx/proxy-confs/inventory.home.conf`:

```nginx
server {
    listen 80;
    listen 443 ssl;
    listen [::]:80;
    listen [::]:443 ssl;

    server_name inventory.home;

    include /config/nginx/ssl.conf;

    location / {
        include /config/nginx/proxy.conf;
        include /config/nginx/resolver.conf;
        set $upstream_app 192.168.0.192;
        set $upstream_port 8787;
        set $upstream_proto http;
        proxy_pass $upstream_proto://$upstream_app:$upstream_port;
    }
}
```

Then restart SWAG (or reload nginx). Reachability:

- Direct: `http://192.168.0.192:8787`
- Via SWAG HTTP: `http://192.168.0.192:180` with Host `inventory.home`, or whatever hostname/port you already use for LAN SWAG access
- Prefer bookmarking `http://inventory.home` once DNS points at LimeTower and SWAG is listening on 80 inside the container (mapped as host **180** unless you also hit it via another path)

If your LAN habit is “always go through SWAG on :180/:1443”, use:

```text
https://inventory.home:1443
```

(or HTTP `:180`) — matching how your other apps are reached.

## 5. Organizr

Add a tab/iframe pointing at the same URL you use in a browser for `inventory.home` (include `:180` / `:1443` if that is how SWAG is published on the LAN).

## Day-to-day updates

| Change | Action on LimeTower |
|--------|---------------------|
| UI / Docker code | `git pull` then `docker compose up -d --build` |
| `inventory/parts.csv` or `builds/*` from GitHub | `git pull` only (bind mounts; no rebuild) |
| Cell edit in the hosted UI | Writes appdata `parts.csv` immediately — **commit & push** from the Unraid clone so GitHub stays source of truth |

## Preferred edit loop

1. Edit on Windows → commit → `git push`
2. On LimeTower: `cd /mnt/user/appdata/homelab-inventory && git pull`
