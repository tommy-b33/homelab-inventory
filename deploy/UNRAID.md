# Deploy on LimeTower (Unraid)

LAN-only inventory UI at **`inventory.home`**, reached via Organizr → **SWAG** → this container.

Do **not** port-forward this app to the internet (no auth; UI can write `parts.csv`).

## Prerequisites

- GitHub repo: https://github.com/tommy-b33/homelab-inventory
- Container already running (see below) on host port **8787**
- **SWAG** — LimeTower maps container 80/443 → host **180** / **1443**
- **Organizr** — `http://192.168.0.192:8081`
- Local DNS for `inventory.home` → `192.168.0.192`

## 1. App container (if not already up)

```bash
cd /mnt/user/appdata/homelab-inventory
git pull
docker build -t homelab-inventory .
docker rm -f homelab-inventory 2>/dev/null
docker run -d \
  --name homelab-inventory \
  --restart unless-stopped \
  -p 8787:8787 \
  -e PORT=8787 \
  -e DATA_ROOT=/app \
  -e DIST_DIR=/app/web/dist \
  -v /mnt/user/appdata/homelab-inventory/inventory:/app/inventory \
  -v /mnt/user/appdata/homelab-inventory/builds:/app/builds \
  -v /mnt/user/appdata/homelab-inventory/archive:/app/archive \
  homelab-inventory
```

Sanity: **http://192.168.0.192:8787**

(Spekarr stays on host **8788**.)

## 2. Local DNS

Add an A record / local DNS override:

| Name | Value |
|------|--------|
| `inventory.home` | `192.168.0.192` |

Pi-hole, AdGuard, or your router’s DNS all work. Confirm from a PC:

```bash
nslookup inventory.home
ping inventory.home
```

## 3. SWAG site config

Drop the repo’s conf into SWAG **site-confs** (not proxy-confs — those only auto-load `*.subdomain.conf`):

```bash
cp /mnt/user/appdata/homelab-inventory/deploy/swag/inventory.home.conf \
  /mnt/user/appdata/swag/nginx/site-confs/inventory.home.conf

docker restart swag
```

Source file in git: [`deploy/swag/inventory.home.conf`](swag/inventory.home.conf)

HTTP-only on purpose — `.home` cannot get a public Let’s Encrypt cert.

## 4. Test via SWAG

Because SWAG’s HTTP is published on host **180**:

```text
http://inventory.home:180
```

You can also hit `http://192.168.0.192:180` with Host header `inventory.home` (browser needs the DNS name).

If that fails, check SWAG logs:

```bash
docker logs swag --tail 80
```

## 5. Organizr tab

1. Open Organizr: **http://192.168.0.192:8081**
2. Settings → **Tabs** (or Categories) → **Add Tab**
3. Suggested fields:
   - **Name:** Inventory
   - **URL:** `http://inventory.home:180`
   - **Tab type:** iFrame (default for most apps)
   - **Icon:** whatever you like
4. Save and open the tab

If the iframe is blank but the URL works in a new browser tab, check Organizr’s “open in new window” / iFrame allow settings — usually fine for LAN HTTP.

### Shortcut (no DNS yet)

Temporary Organizr URL while DNS is pending:

```text
http://192.168.0.192:8787
```

(SWAG optional for that path.)

## Day-to-day updates

| Change | Action on LimeTower |
|--------|---------------------|
| `parts.csv` / `builds/*` from GitHub | `cd /mnt/user/appdata/homelab-inventory && git pull` |
| UI / Dockerfile | `git pull`, then rebuild/run the `docker build` + `docker run` block above |
| Cell edit in hosted UI | Commit/push from the Unraid clone so GitHub stays in sync |

## Preferred edit loop

1. Edit on Windows → commit → `git push`
2. On LimeTower: `cd /mnt/user/appdata/homelab-inventory && git pull`
