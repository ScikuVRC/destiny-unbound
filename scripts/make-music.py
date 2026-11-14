#!/usr/bin/env python3
"""Make HD music takes with ACE-Step 1.5 (MIT licence), run locally.

Run it with ACE-Step's own environment, from the game folder:

    uv run --project ../ACE-Step-1.5 python scripts/make-music.py                 # every slot, 3 takes each
    uv run --project ../ACE-Step-1.5 python scripts/make-music.py title battle -n 4
    uv run --project ../ACE-Step-1.5 python scripts/make-music.py title --theme bloodmoon

Takes are saved as WAV in music-src/takes/<theme or shared>/<slot>-<seed>.wav (not committed). Listen, keep the
best, copy it to music-src/<slot>.wav (or music-src/<theme>/<slot>.wav) and convert it for the game with the ffmpeg
line in docs/music-credits.md. Log the seed of the take you keep in the credits table.
"""
import argparse
import os
import random
import sys
import time

GAME = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ACE = os.environ.get("ACESTEP_DIR", os.path.join(os.path.dirname(GAME), "ACE-Step-1.5"))
sys.path.insert(0, ACE)

LOOP = ", seamless loop, no intro, no outro"
SLOTS = {
    # slot: (prompt, seconds, bpm)
    "title": ("dark fantasy, orchestral, main theme, instrumental, slow solemn strings, low male choir, distant war drums, "
              "hurdy-gurdy, mysterious, grand, cinematic, minor key" + LOOP, 150, 70),
    "spin": ("dark fantasy, medieval folk, instrumental, plucked lute ostinato, harp, soft frame drum, light shaker, "
             "curious, anticipation, playful but mysterious, steady rhythm" + LOOP, 120, 95),
    "story": ("dark fantasy, cinematic folk, instrumental, solo cello melody, folk fiddle, warm low strings, soft wind "
              "ambience, wistful, hopeful, journey, adventure, minor key" + LOOP, 180, 80),
    "battle": ("epic dark fantasy, battle music, orchestral, instrumental, pounding taiko drums, war drums, aggressive "
               "low brass, staccato strings, chanting choir, tense, driving, fast, minor key" + LOOP, 120, 140),
    "victory": ("short triumphant fantasy fanfare, orchestral, instrumental, brass and timpani, rising, bright major "
                "chord ending", 12, 100),
    "defeat": ("short tragic fantasy sting, instrumental, solo cello, low choir, slow falling minor chord, fading out",
               12, 60),
    "legend": ("short glorious ascension fanfare, orchestral, full choir, shimmering bells, harp glissando, rising to a "
               "radiant major chord", 14, 80),
}
THEMES = {
    "ashen": "ash and embers",
    "astral": "celestial, ethereal",
    "iron": "pipe organ, industrial",
    "bloodmoon": "gothic, eerie",
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("slots", nargs="*", help="slots to make (default: all): " + ", ".join(SLOTS))
    ap.add_argument("-n", "--takes", type=int, default=3, help="takes per slot")
    ap.add_argument("--theme", choices=sorted(THEMES), help="flavour the prompt for one theme")
    ap.add_argument("--no-lm", action="store_true", help="skip ACE-Step's planning model (faster, less structure)")
    ap.add_argument("--lm", default="acestep-5Hz-lm-1.7B", help="planning model (0.6B is lighter)")
    ap.add_argument("-q", "--quality", choices=["fast", "high", "best"], default="fast",
                    help="fast: turbo model, 8 steps; high: SFT model, 50 steps; best: XL SFT model (4B), 50 steps, "
                         "slow on a 16 GB card")
    args = ap.parse_args()
    slots = args.slots or list(SLOTS)
    bad = [s for s in slots if s not in SLOTS]
    if bad:
        ap.error("unknown slot: " + ", ".join(bad))

    from acestep.handler import AceStepHandler
    from acestep.inference import GenerationConfig, GenerationParams, generate_music

    model, steps, cfg = {"fast": ("acestep-v15-turbo", 8, 1.0), "high": ("acestep-v15-sft", 50, 7.0),
                         "best": ("acestep-v15-xl-sft", 50, 7.0)}[args.quality]
    xl = args.quality == "best"
    dit = AceStepHandler()
    msg, ok = dit.initialize_service(project_root=ACE, config_path=model, device="auto", offload_to_cpu=xl,
                                     offload_dit_to_cpu=False)
    if not ok:
        sys.exit("ACE-Step model failed to load: " + str(msg))
    llm = None
    if not args.no_lm:
        from acestep.llm_inference import LLMHandler
        llm = LLMHandler()
        msg, ok = llm.initialize(checkpoint_dir=os.path.join(ACE, "checkpoints"), lm_model_path=args.lm, backend="pt",
                                 device="auto", offload_to_cpu=xl, dtype=None)
        if not ok:
            print("Planning model failed to load, continuing without it:", msg)
            llm = None

    out = os.path.join(GAME, "music-src", "takes", args.theme or "shared")
    os.makedirs(out, exist_ok=True)
    for slot in slots:
        prompt, secs, bpm = SLOTS[slot]
        if args.theme:
            prompt += ", " + THEMES[args.theme]
        for _ in range(args.takes):
            seed = random.randint(1, 2**31 - 1)
            params = GenerationParams(task_type="text2music", caption=prompt, lyrics="[Instrumental]",
                                      instrumental=True, bpm=bpm, duration=secs, inference_steps=steps,
                                      guidance_scale=cfg, seed=seed, thinking=llm is not None)
            t0 = time.time()
            res = generate_music(dit, llm, params=params, config=GenerationConfig(batch_size=1, audio_format="wav"),
                                 save_dir=out)
            if not res.success:
                print(f"{slot}: failed ({res.status_message})")
                continue
            for a in res.audios:
                src = a.get("path")
                if src and os.path.exists(src):
                    dst = os.path.join(out, f"{slot}-{args.quality}-{seed}.wav")
                    os.replace(src, dst)
                    print(f"{slot}: {os.path.relpath(dst, GAME)} ({time.time() - t0:.1f}s)")


if __name__ == "__main__":
    main()
