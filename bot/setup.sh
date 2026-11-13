#!/usr/bin/env bash
# Installs or updates the Destiny Unbound Discord bot on an Ubuntu server, as a service that restarts by itself.
#   bash setup.sh           install or update (asks for the bot token the first time)
#   bash setup.sh --token   replace the bot token
# The token is kept in /etc/destiny-bot.env (readable by root only) and never printed.
# SPDX-License-Identifier: GPL-3.0-or-later
set -euo pipefail
REPO=https://github.com/ScikuVRC/destiny-unbound.git
DIR=/opt/destiny-unbound
ENV=/etc/destiny-bot.env
SVC=destiny-bot
say() { printf '\n== %s\n' "$*"; }

say "System packages"
sudo apt-get update -qq
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq git nodejs npm ca-certificates >/dev/null
node --version

# 1 GB of memory is tight for npm: add 1 GB of swap once
if ! swapon --show | grep -q /swapfile; then
  say "Adding 1 GB of swap"
  sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile >/dev/null && sudo swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

# a user with no login and no home of its own runs the bot
id destinybot >/dev/null 2>&1 || sudo useradd --system --no-create-home --shell /usr/sbin/nologin destinybot

say "Game code from GitHub"
if [ -d "$DIR/.git" ]; then sudo git -C "$DIR" fetch -q --depth 1 origin main && sudo git -C "$DIR" reset -q --hard origin/main
else sudo git clone -q --depth 1 "$REPO" "$DIR"; fi
sudo git -C "$DIR" log -1 --format='   at commit %h: %s'
( cd "$DIR/bot" && sudo npm ci --omit=dev --no-audit --no-fund --loglevel=error )
sudo chown -R root:root "$DIR"

if [ ! -s "$ENV" ] || [ "${1:-}" = "--token" ]; then
  say "Bot token"
  echo "Paste the bot token (Discord Developer Portal > your app > Bot > Reset Token). It won't show as you paste."
  read -rsp "Token: " TOKEN; echo
  [ -n "$TOKEN" ] || { echo "No token given."; exit 1; }
  printf 'DISCORD_TOKEN=%s\n' "$TOKEN" | sudo tee "$ENV" >/dev/null
  sudo chown root:root "$ENV" && sudo chmod 600 "$ENV"
  unset TOKEN
fi

say "Service"
sudo tee /etc/systemd/system/$SVC.service >/dev/null <<UNIT
[Unit]
Description=Destiny Unbound Discord bot (/spin)
After=network-online.target
Wants=network-online.target

[Service]
User=destinybot
EnvironmentFile=$ENV
WorkingDirectory=$DIR/bot
ExecStart=/usr/bin/node index.js
Restart=always
RestartSec=10
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
PrivateTmp=true
MemoryMax=400M

[Install]
WantedBy=multi-user.target
UNIT
sudo systemctl daemon-reload
sudo systemctl enable -q $SVC
sudo systemctl restart $SVC
sleep 6
sudo systemctl --no-pager --lines=5 status $SVC || true
say "Done. Logs: sudo journalctl -u $SVC -f    Update: bash $DIR/bot/setup.sh"
