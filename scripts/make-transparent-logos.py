"""Make transparent PNG versions of the four theme logos.

The painted logos (app/art/*-logo.jpg) sit on a black background. This keeps every part of the artwork that is
not connected to the black edge fully opaque, and turns the black background (plus the glow and sparks that fade
into it) into transparency, so the result looks the same over black and still works over other colours.

Usage: python scripts/make-transparent-logos.py   (needs Pillow and numpy)
Output: brand/logo-<theme>.png, trimmed to the artwork with a small margin.
"""
import os
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THEMES = ["ashen", "astral", "iron", "bloodmoon"]
# Astral is thin glowing lines with dark gaps between them: treat every dark pixel as background there.
GLOW_ONLY = {"astral"}
FLOOR = 0.04   # darker than this (max channel, 0..1) is pure background
CEIL = 0.22    # brighter than this is fully opaque
SOLID = 15     # a near-black patch at least this wide also counts as background (letter holes, rings)
SEED = 0.10    # "near-black" for those patches
PAD = 24


def background_mask(m, dark):
    """Dark pixels connected to the image edge or to a solid black patch (flood fill by repeated dilation)."""
    black = Image.fromarray(((m < SEED) * 255).astype(np.uint8)).filter(ImageFilter.MinFilter(SOLID))
    seen = (np.asarray(black) > 0) & dark
    seen[0, :] = dark[0, :]
    seen[-1, :] = dark[-1, :]
    seen[:, 0] = dark[:, 0]
    seen[:, -1] = dark[:, -1]
    while True:
        grown = seen.copy()
        grown[1:, :] |= seen[:-1, :]
        grown[:-1, :] |= seen[1:, :]
        grown[:, 1:] |= seen[:, :-1]
        grown[:, :-1] |= seen[:, 1:]
        grown &= dark
        if (grown == seen).all():
            return seen
        seen = grown


def convert(theme):
    src = os.path.join(ROOT, "app", "art", f"{theme}-logo.jpg")
    rgb = np.asarray(Image.open(src).convert("RGB")).astype(np.float64) / 255.0
    m = rgb.max(axis=2)
    bg = (m < CEIL) if theme in GLOW_ONLY else background_mask(m, m < CEIL)
    alpha = np.ones_like(m)
    ramp = np.clip((m - FLOOR) / (CEIL - FLOOR), 0.0, 1.0)
    alpha[bg] = ramp[bg]
    # Un-premultiply over black so the image composites back to the original over black.
    safe = np.maximum(alpha, 1e-6)[..., None]
    col = np.where(bg[..., None], np.clip(rgb / safe, 0.0, 1.0), rgb)
    col[alpha <= 0] = 0
    out = np.dstack([col, alpha])
    ys, xs = np.where(alpha > 0.02)
    y0, y1 = max(ys.min() - PAD, 0), min(ys.max() + PAD + 1, m.shape[0])
    x0, x1 = max(xs.min() - PAD, 0), min(xs.max() + PAD + 1, m.shape[1])
    out = (out[y0:y1, x0:x1] * 255 + 0.5).astype(np.uint8)
    dst = os.path.join(ROOT, "brand", f"logo-{theme}.png")
    Image.fromarray(out, "RGBA").save(dst, optimize=True)
    print(f"{dst}: {out.shape[1]}x{out.shape[0]}, {os.path.getsize(dst) // 1024} KB")


if __name__ == "__main__":
    os.makedirs(os.path.join(ROOT, "brand"), exist_ok=True)
    for t in THEMES:
        convert(t)
