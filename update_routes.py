import os
import re
import json
import math
import base64
import urllib.request
import urllib.error
from datetime import datetime, timedelta, timezone
from pathlib import Path

# --- CONFIGURATION ---
DATA_DIR = Path("public/data")
DATA_DIR.mkdir(parents=True, exist_ok=True)

DOMAIN_CHUNK_SIZE = 300   # KeeneticOS 5.0+ limit per DNS list file
IP_CHUNK_SIZE = 1024      # KeeneticOS limit per .bat route file

# Encoded URL endpoints
_U1 = base64.b64decode("aHR0cHM6Ly9hbnRpZmlsdGVyLmRvd25sb2FkL2xpc3QvYWxseW91bmVlZC5sc3Q=").decode()
_U2 = base64.b64decode("aHR0cHM6Ly9jb21tdW5pdHkuYW50aWZpbHRlci5kb3dubG9hZC9saXN0L2NvbW11bml0eS5sc3Q=").decode()
_U3 = base64.b64decode("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL3YyZmx5L2RvbWFpbi1saXN0LWNvbW11bml0eS9tYXN0ZXIvZGF0YS9jYXRlZ29yeS1ydQ==").decode()

SOURCES = {
    "antifilter_allyouneed": os.getenv("URL_ANTIFILTER", _U1),
    "antifilter_community": os.getenv("URL_COMMUNITY", _U2),
    "category_ru_domains": os.getenv("URL_CATEGORY_RU", _U3)
}

HEADERS = {
    "User-Agent": "KeeneticRouteUpdater/1.0"
}

# Offline / Fallback default domain and IP lists
FALLBACK_RU_DOMAINS = [
    "gosuslugi.ru", "yandex.ru", "vk.com", "sberbank.ru", "tbank.ru",
    "ozon.ru", "wildberries.ru", "mail.ru", "kinopoisk.ru", "avito.ru"
]

FALLBACK_VPN_DOMAINS = [
    "youtube.com", "googlevideo.com", "ytimg.com", "instagram.com",
    "cdninstagram.com", "openai.com", "chatgpt.com", "telegram.org",
    "t.me", "discord.com", "discordapp.com", "ntc.party"
]

FALLBACK_VPN_IPS = [
    "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
    "141.101.64.0/18", "108.162.192.0/18", "190.93.240.0/20", "188.114.96.0/20"
]

def fetch_url(url: str, timeout: int = 15) -> str:
    """Fetch text content from a URL safely."""
    print(f"[*] Fetching: {url}")
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"[!] Warning: Failed to fetch {url} ({e})")
        return ""

def clean_domain(domain: str) -> str:
    """Clean and validate domain string."""
    domain = domain.strip().lower()
    if domain.startswith("regexp:") or domain.startswith("full:") or domain.startswith("keyword:"):
        domain = domain.split(":", 1)[1]
    domain = re.sub(r'^[.*]+', '', domain)  # remove leading wildcards
    domain = domain.split('#')[0].strip()   # remove comments
    if domain and re.match(r'^[a-z0-9\-\._]+$', domain) and '.' in domain:
        return domain
    return ""

def parse_ip_or_cidr(line: str) -> str:
    """Validate IP or CIDR string."""
    line = line.strip().split('#')[0].strip()
    if not line:
        return ""
    match = re.match(r'^(\d{1,3}\.){3}\d{1,3}(/\d{1,2})?$', line)
    if match:
        return line
    return ""

def chunk_list(lst: list, chunk_size: int):
    """Yield successive chunks from lst."""
    for i in range(0, len(lst), chunk_size):
        yield lst[i:i + chunk_size]

def main():
    now = datetime.now(timezone.utc)
    next_update = now + timedelta(days=14)

    print(f"=== Starting Route Update Pipeline at {now.isoformat()} ===")

    # 1. Fetch RU domains (for Direct ISP routing)
    raw_ru = fetch_url(SOURCES["category_ru_domains"])
    ru_domains = set()
    for line in raw_ru.splitlines():
        d = clean_domain(line)
        if d:
            ru_domains.add(d)

    if not ru_domains:
        print("[!] Network offline or fetch failed. Using fallback RU domain list.")
        ru_domains.update(FALLBACK_RU_DOMAINS)

    # 2. Fetch Antifilter / Community list for AmneziaWG VPN routing
    raw_antifilter = fetch_url(SOURCES["antifilter_allyouneed"])
    vpn_ips = set()
    for line in raw_antifilter.splitlines():
        ip = parse_ip_or_cidr(line)
        if ip:
            vpn_ips.add(ip)

    raw_community = fetch_url(SOURCES["antifilter_community"])
    vpn_domains = set()
    for line in raw_community.splitlines():
        if '/' in line or re.match(r'^\d', line):
            ip = parse_ip_or_cidr(line)
            if ip:
                vpn_ips.add(ip)
        else:
            d = clean_domain(line)
            if d and d not in ru_domains:
                vpn_domains.add(d)

    if not vpn_domains:
        print("[!] Network offline or fetch failed. Using fallback VPN domain list.")
        vpn_domains.update(FALLBACK_VPN_DOMAINS)

    if not vpn_ips:
        print("[!] Network offline or fetch failed. Using fallback VPN IP range list.")
        vpn_ips.update(FALLBACK_VPN_IPS)

    sorted_ru_domains = sorted(list(ru_domains))
    sorted_vpn_domains = sorted(list(vpn_domains))
    sorted_vpn_ips = sorted(list(vpn_ips))

    print(f"[+] Loaded {len(sorted_ru_domains)} RU Direct domains")
    print(f"[+] Loaded {len(sorted_vpn_domains)} VPN Tunnel domains")
    print(f"[+] Loaded {len(sorted_vpn_ips)} VPN Tunnel IP/CIDR ranges")

    # 3. Export Keenetic Domain Rule TXT Files (Max 300 domains per file)
    domain_files = []
    ru_chunks = list(chunk_list(sorted_ru_domains, DOMAIN_CHUNK_SIZE))
    for idx, chunk in enumerate(ru_chunks, start=1):
        filename = f"ru_direct_domains_part{idx}.txt"
        filepath = DATA_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"# KeeneticOS Domain Name Rules - RU Direct Part {idx}/{len(ru_chunks)}\n")
            f.write(f"# Updated: {now.strftime('%Y-%m-%d %H:%M UTC')}\n\n")
            f.write("\n".join(chunk) + "\n")
        domain_files.append(filename)

    vpn_domain_chunks = list(chunk_list(sorted_vpn_domains, DOMAIN_CHUNK_SIZE))
    for idx, chunk in enumerate(vpn_domain_chunks, start=1):
        filename = f"vpn_tunnel_domains_part{idx}.txt"
        filepath = DATA_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"# KeeneticOS Domain Name Rules - VPN Tunnel Part {idx}/{len(vpn_domain_chunks)}\n")
            f.write(f"# Updated: {now.strftime('%Y-%m-%d %H:%M UTC')}\n\n")
            f.write("\n".join(chunk) + "\n")
        domain_files.append(filename)

    # 4. Export BAT static route files (Max 1024 routes per file)
    bat_files = []
    ip_chunks = list(chunk_list(sorted_vpn_ips, IP_CHUNK_SIZE))
    for idx, chunk in enumerate(ip_chunks, start=1):
        filename = f"amnezia_routes_part{idx}.bat"
        filepath = DATA_DIR / filename
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"@echo off\n:: Keenetic static routes script - Part {idx}/{len(ip_chunks)}\n")
            f.write(f":: Updated: {now.strftime('%Y-%m-%d %H:%M UTC')}\n\n")
            for entry in chunk:
                if '/' in entry:
                    f.write(f"route ADD {entry} 0.0.0.0 rem AmneziaWG\n")
                else:
                    f.write(f"route ADD {entry} MASK 255.255.255.255 0.0.0.0 rem AmneziaWG\n")
        bat_files.append(filename)

    # 5. Export Master JSON Data
    master_json = {
        "metadata": {
            "last_updated": now.isoformat(),
            "next_update": next_update.isoformat(),
            "update_interval_days": 14,
            "version": "1.0.0",
            "generator": "Keenetic Route Generator Pipeline"
        },
        "statistics": {
            "total_ru_direct_domains": len(sorted_ru_domains),
            "total_vpn_tunnel_domains": len(sorted_vpn_domains),
            "total_vpn_ip_ranges": len(sorted_vpn_ips),
            "ru_domain_chunks_count": len(ru_chunks),
            "vpn_domain_chunks_count": len(vpn_domain_chunks),
            "ip_bat_chunks_count": len(ip_chunks)
        },
        "ru_direct": {
            "description": "Domains routed directly through ISP (RU websites, banks, state portals)",
            "domains_sample": sorted_ru_domains[:100],
            "files": [f"{f}" for f in domain_files if "ru_direct" in f]
        },
        "vpn_tunnel": {
            "description": "Domains and IPs routed through AmneziaWG VPN interface",
            "domains_sample": sorted_vpn_domains[:100],
            "ip_ranges_sample": sorted_vpn_ips[:100],
            "domain_files": [f"{f}" for f in domain_files if "vpn_tunnel" in f],
            "bat_files": [f"{f}" for f in bat_files]
        }
    }

    json_path = DATA_DIR / "routes.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(master_json, f, ensure_ascii=False, indent=2)

    print(f"[+] Successfully generated routes.json and {len(domain_files) + len(bat_files)} partition files!")

if __name__ == "__main__":
    main()
