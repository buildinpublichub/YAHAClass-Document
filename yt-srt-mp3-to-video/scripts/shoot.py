#!/usr/bin/env python3
"""自检截图：截每个场景的关键时刻，拼成总览图供检查。

用法：
  python3 shoot.py --html 项目/成片网页.html --out 项目/schematic/check                # 每个场景：开头 / 中段 / 结尾三帧
  python3 shoot.py --html ... --out ... --scenes s03,s07                             # 只截这些场景
  python3 shoot.py --html ... --out ... --times 5.9,26.2                             # 截任意时间点（查中途帧 / 转场）
  python3 shoot.py --html ... --out ... --steps                                       # 每个场景按 sequence 的每一步各截一帧（步骤时刻后 1 秒，动作通常已完成）
--times 可与 --scenes / --steps 同时使用，结果合并。
总览图 sheet*.jpg 是缩略图（横版 4 列、竖版 8 列），用来看整体；小字、图标位置要打开同目录的单帧原图（全尺寸 jpg）检查。
"""
import argparse, os, pathlib
from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright
from common import page_size


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--scenes", default="")
    ap.add_argument("--times", default="")
    ap.add_argument("--steps", action="store_true")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    url = pathlib.Path(a.html).resolve().as_uri() + "?render=1"
    W, H = page_size(a.html)
    shots = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H})
        pg.goto(url)
        pg.wait_for_function("window.__ready !== undefined")
        pg.evaluate("window.__ready")
        jobs = [(f"t{float(t):.1f}", float(t)) for t in a.times.split(",")] if a.times else []
        if not a.times or a.steps or a.scenes:
            scenes = pg.evaluate("window.__scenes")
            want = set(a.scenes.split(",")) if a.scenes else None
            for s in scenes:
                if want and s["id"] not in want:
                    continue
                end = min(s["t1"], s["exit"] - 0.35)          # 结尾：最后一句结束时，但早于出场淡出
                if a.steps and s["steps"]:
                    st = s["steps"]
                    for k, t in enumerate(st):                   # 每一步：步骤时刻后 1 秒，且早于下一步开始
                        nxt = st[k + 1] - 0.05 if k + 1 < len(st) else end
                        jobs.append((f"{s['id']}·{k + 1}", max(t, min(t + 1.0, nxt, end))))
                    jobs.append((f"{s['id']}·末", end))
                else:
                    jobs += [(f"{s['id']}·始", s["enter"] + 0.6), (f"{s['id']}·中", (s["enter"] + end) / 2),
                             (f"{s['id']}·末", end)]
        for label, t in jobs:
            pg.evaluate("t => window.__frame(t)", t)
            f = os.path.join(a.out, f"{label.replace('·', '_')}.jpg")
            pg.screenshot(path=f, type="jpeg", quality=88)
            shots.append((f"{label} {t:.1f}s", f))
        br.close()
    cols = 4 if W >= H else 8
    tw = 480 if W >= H else 240
    th = round(tw * H / W)
    rows = 4 if W >= H else 2
    per = cols * rows
    for g in range(0, len(shots), per):
        sheet = Image.new("RGB", (cols * tw, rows * th), (40, 40, 40))
        for i, (label, f) in enumerate(shots[g:g + per]):
            im = Image.open(f).convert("RGB").resize((tw, th))
            d = ImageDraw.Draw(im)
            d.rectangle((0, 0, 8 + 7 * len(label), 20), fill="black")
            d.text((5, 4), label, fill=(255, 220, 0))
            sheet.paste(im, ((i % cols) * tw, (i // cols) * th))
        sheet.save(os.path.join(a.out, f"sheet{g // per + 1:02d}.jpg"), quality=85)
    print(f"已截 {len(shots)} 张（{W}×{H}），总览图 {(len(shots) + per - 1) // per} 张：{a.out}")


if __name__ == "__main__":
    main()
