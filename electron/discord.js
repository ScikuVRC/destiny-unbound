// Discord Rich Presence: shows "Playing Destiny Unbound" and what the player is doing in their Discord status.
// It talks only to the Discord app on this computer, through Discord's local IPC pipe: nothing goes over the
// network from here, and nothing happens if Discord isn't running or no Application ID is set.
// Protocol: frames of [opcode int32 LE][length int32 LE][JSON]. 0 = handshake, 1 = frame, 2 = close, 3 = ping, 4 = pong.
// SPDX-License-Identifier: GPL-3.0-or-later
'use strict';
const net = require('net');
const path = require('path');

const OP = { HANDSHAKE: 0, FRAME: 1, CLOSE: 2, PING: 3, PONG: 4 };
const MIN_GAP = 4000; // Discord allows about 5 activity updates per 20 seconds
const RETRY = 30000; // look for Discord again this often while it isn't running

function pipePaths(prefix) {
  if (prefix) return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => prefix + i);
  if (process.platform === 'win32') return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => '\\\\?\\pipe\\discord-ipc-' + i);
  const env = process.env,
    dirs = [env.XDG_RUNTIME_DIR, env.TMPDIR, env.TMP, env.TEMP, '/tmp'].filter(Boolean);
  const out = [];
  dirs.forEach(d => {
    for (let i = 0; i < 10; i++) out.push(path.join(d, 'discord-ipc-' + i));
  });
  return out;
}

function encode(op, obj) {
  const body = Buffer.from(JSON.stringify(obj), 'utf8'),
    head = Buffer.alloc(8);
  head.writeInt32LE(op, 0);
  head.writeInt32LE(body.length, 4);
  return Buffer.concat([head, body]);
}

/* Short text Discord accepts: 2 to 128 characters (shorter is padded, longer is cut). */
function clip(s) {
  s = String(s == null ? '' : s)
    // eslint-disable-next-line no-control-regex -- strip control characters
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim();
  if (!s) return undefined;
  if (s.length < 2) s += ' ';
  return s.length > 128 ? s.slice(0, 127) + '…' : s;
}

/* Turn what the game sends into a Discord activity; anything unexpected is dropped. */
function toActivity(p, startedAt) {
  if (!p || typeof p !== 'object') return null;
  const a = {
    details: clip(p.details),
    state: clip(p.state),
    timestamps: { start: Math.floor(startedAt / 1000) },
    assets: {},
    instance: false,
  };
  if (p.image) a.assets.large_image = String(p.image).slice(0, 64);
  if (p.imageText) a.assets.large_text = clip(p.imageText);
  if (p.small) a.assets.small_image = String(p.small).slice(0, 64);
  if (p.smallText) a.assets.small_text = clip(p.smallText);
  if (!Object.keys(a.assets).length) delete a.assets;
  if (Array.isArray(p.buttons)) {
    const b = p.buttons
      .filter(x => x && /^https:\/\//.test(x.url))
      .slice(0, 2)
      .map(x => ({ label: String(x.label || '').slice(0, 32), url: String(x.url).slice(0, 512) }));
    if (b.length) a.buttons = b;
  }
  Object.keys(a).forEach(k => a[k] === undefined && delete a[k]);
  return a;
}

class Presence {
  constructor(opts) {
    this.clientId = String(opts.clientId || '');
    this.pipePrefix = opts.pipePrefix || null; // for tests: a stand-in Discord
    this.log = opts.log || (() => {});
    this.pid = opts.pid || process.pid;
    this.startedAt = opts.startedAt || Date.now();
    this.sock = null;
    this.ready = false;
    this.enabled = false;
    this.closed = false;
    this.want = null;
    this.sent = null;
    this.lastSend = 0;
    this.timer = null;
    this.retryTimer = null;
    this.buf = Buffer.alloc(0);
    this.nonce = 0;
  }
  get usable() {
    return /^\d{15,25}$/.test(this.clientId);
  }

  setEnabled(on) {
    this.enabled = !!on && this.usable;
    if (this.enabled) this.connect();
    else {
      this.want = null;
      this.flush(true);
    }
  }
  set(p) {
    this.want = p ? toActivity(p, this.startedAt) : null;
    this.schedule();
  }

  connect() {
    if (this.sock || this.closed || !this.enabled) return;
    const paths = pipePaths(this.pipePrefix);
    const tryAt = i => {
      if (i >= paths.length) {
        this.retryLater();
        return;
      }
      const s = net.createConnection(paths[i]);
      s.once('error', () => {
        s.destroy();
        tryAt(i + 1);
      });
      s.once('connect', () => {
        s.removeAllListeners('error');
        this.sock = s;
        this.buf = Buffer.alloc(0);
        s.on('data', d => this.onData(d));
        s.on('error', e => this.log('Discord: ' + e.message));
        s.on('close', () => this.onClose());
        s.write(encode(OP.HANDSHAKE, { v: 1, client_id: this.clientId }));
      });
    };
    tryAt(0);
  }
  retryLater() {
    if (this.retryTimer || this.closed || !this.enabled) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.connect();
    }, RETRY);
    if (this.retryTimer.unref) this.retryTimer.unref();
  }
  onData(d) {
    this.buf = Buffer.concat([this.buf, d]);
    while (this.buf.length >= 8) {
      const op = this.buf.readInt32LE(0),
        len = this.buf.readInt32LE(4);
      if (this.buf.length < 8 + len) return;
      let msg = null;
      try {
        msg = JSON.parse(this.buf.slice(8, 8 + len).toString('utf8'));
      } catch (e) {
        /* ignore a bad frame */
      }
      this.buf = this.buf.slice(8 + len);
      if (op === OP.PING) {
        this.sock.write(encode(OP.PONG, msg || {}));
        continue;
      }
      if (op === OP.CLOSE) {
        this.log('Discord closed the connection: ' + (msg && msg.message));
        this.sock.end();
        continue;
      }
      if (msg && msg.evt === 'READY') {
        this.ready = true;
        this.sent = undefined;
        this.schedule();
      } else if (msg && msg.evt === 'ERROR') this.log('Discord: ' + (msg.data && msg.data.message));
    }
  }
  onClose() {
    this.sock = null;
    this.ready = false;
    this.sent = undefined;
    this.retryLater();
  }
  schedule() {
    if (this.timer) return;
    const wait = Math.max(0, this.lastSend + MIN_GAP - Date.now());
    this.timer = setTimeout(() => {
      this.timer = null;
      this.flush();
    }, wait);
    if (this.timer.unref) this.timer.unref();
  }
  flush(force) {
    if (!this.sock || !this.ready) return;
    const json = JSON.stringify(this.want);
    if (!force && json === this.sent) return;
    this.sent = json;
    this.lastSend = Date.now();
    this.sock.write(
      encode(OP.FRAME, {
        cmd: 'SET_ACTIVITY',
        args: { pid: this.pid, activity: this.want || null },
        nonce: String(++this.nonce),
      })
    );
  }
  close() {
    this.closed = true;
    clearTimeout(this.timer);
    clearTimeout(this.retryTimer);
    if (this.sock) {
      try {
        this.sock.write(
          encode(OP.FRAME, { cmd: 'SET_ACTIVITY', args: { pid: this.pid, activity: null }, nonce: 'bye' })
        );
      } catch (e) {
        /* closing anyway */
      }
      this.sock.destroy();
    }
  }
}

module.exports = { Presence, toActivity, encode, OP };
