#!/usr/bin/env python3
"""成片网页数据审计：在网页里逐场景量出「观众读不读得到内容」的几项硬指标，补足截图目测。

用法：
  python3 audit.py --html 项目/成片网页.html                         # 每个场景的结尾帧
  python3 audit.py --html ... --steps                                 # 连 sequence 的每一步一起查
  python3 audit.py --html ... --only c3-,c4-  --json 项目/schematic/check/audit.json

每一帧量出：
- 主体文字字号（按实际缩放后的画布像素）：< 26px 记为「小字」；常驻导航单独统计（要求 ≥ 22px）
- 主体内容外框占安全区的宽 / 高比例（不含常驻导航）：结尾帧要求宽 ≥ 75%、高 ≥ 60%
- 仍处于「等待出场」占位（50% 透明度，旧称模糊）的元素数（导航除外）：结尾帧应为 0（旁白讲过的东西不能还是占位）
- 空胶囊数：应为 0
- 骨架横条数：≥ 6 条提示检查；只有「一大段文字 / 数量多」本身就是命题时才保留，且第一行要是真实文字
审计只是辅助，最终以看截图为准；动画过渡中的一瞬（弹出、缩放途中）报出的小字可以忽略。
"""
import argparse, json, pathlib, statistics
from playwright.sync_api import sync_playwright
from common import page_size

MIN_PX, NAV_MIN_PX, COVER_W, COVER_H, SKEL_WARN = 26, 22, .75, .60, 6

JS = r"""
() => {
  const stage = document.getElementById('stage');
  const root = stage.querySelector('.scr');
  if (!root) return null;
  const sr = stage.getBoundingClientRect();
  const VWp = stage.classList.contains('v') ? 1080 : 1920, VHp = stage.classList.contains('v') ? 1920 : 1080;
  const k = sr.width / VWp;
  const SAFE = window.SAFE || {x0:120, x1:1800, y0:90, y1:990};
  const vis = el => { let o = 1, b = 0;
    for (let e = el; e && e !== stage; e = e.parentElement) {
      const cs = getComputedStyle(e); if (cs.display === 'none' || cs.visibility === 'hidden') return [0, 0];
      o *= parseFloat(cs.opacity); const m = /blur\(([\d.]+)px\)/.exec(cs.filter || ''); if (m) b = Math.max(b, +m[1]);
      if (e._fx && e._fx.blur) b = Math.max(b, e._fx.blur);   // 引擎把「等待出场」渲染成 50% 透明度（不再是模糊滤镜），占位状态记在 _fx.blur
    } return [o, b]; };
  const inNav = el => { for (let e = el; e && e !== root; e = e.parentElement) if (e.dataset && e.dataset.keep) return true; return false; };
  const texts = [], boxes = []; let blurred = 0, emptyPill = 0, skel = 0;
  for (const el of root.querySelectorAll('*')) {
    if (el === root._veil) continue;
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    if (r.right < sr.left || r.left > sr.right || r.bottom < sr.top || r.top > sr.bottom) continue;
    const [o, b] = vis(el); if (o < 0.25) continue;
    const nav = inNav(el);
    const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join('');
    if (own) {
      const cs = getComputedStyle(el); const sc = el.offsetWidth ? r.width / el.offsetWidth : 1;
      texts.push({t: own.slice(0, 24), px: Math.round(parseFloat(cs.fontSize) * (isFinite(sc) && sc > 0 ? sc : 1) / k * 10) / 10, nav});
    }
    if (b >= 2 && !nav) blurred++;
    if (el.classList.contains('pill') && !el.textContent.trim()) emptyPill++;
    if (el.classList.contains('sk') && !nav) skel++;
    const tag = el.tagName.toLowerCase();
    if (nav || tag === 'svg' || tag === 'g' || tag === 'defs') continue;
    if (r.width / k > VWp * .88 && r.height / k > VHp * .88) continue;   // 全屏容器 / 遮罩
    boxes.push([(r.left - sr.left) / k, (r.top - sr.top) / k, (r.right - sr.left) / k, (r.bottom - sr.top) / k]);
  }
  let bb = null;
  if (boxes.length) bb = [Math.min(...boxes.map(b => b[0])), Math.min(...boxes.map(b => b[1])), Math.max(...boxes.map(b => b[2])), Math.max(...boxes.map(b => b[3]))];
  return {texts, bb, blurred, emptyPill, skel, safe: SAFE, VW: VWp, VH: VHp};
}
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", required=True)
    ap.add_argument("--steps", action="store_true", help="连每一步一起查（默认只查结尾帧）")
    ap.add_argument("--only", default="", help="按场景 id 前缀过滤，逗号分隔，如 c3-,c4-")
    ap.add_argument("--json", default="", help="把逐帧结果写成 JSON")
    a = ap.parse_args()
    only = [x for x in a.only.split(",") if x]
    W, H = page_size(a.html)
    url = pathlib.Path(a.html).resolve().as_uri() + "?render=1"
    res = []
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H})
        pg.goto(url)
        pg.wait_for_function("window.__ready !== undefined")
        pg.evaluate("window.__ready")
        for s in pg.evaluate("window.__scenes"):
            if only and not any(s["id"].startswith(o) for o in only):
                continue
            end = min(s["t1"], s["exit"] - 0.35)
            times = [(str(i + 1), min(t + 1.0, end)) for i, t in enumerate(s["steps"] or [])] if a.steps else []
            times.append(("末", end))
            for lab, t in times:
                pg.evaluate("t => window.__frame(t)", t)
                d = pg.evaluate(JS)
                if not d:
                    continue
                main_t = [x for x in d["texts"] if not x["nav"]]
                sz = [x["px"] for x in main_t]
                sf, bb = d["safe"], d["bb"]
                cw = ch = 0
                if bb:
                    cw = (min(bb[2], d["VW"]) - max(bb[0], 0)) / (sf["x1"] - sf["x0"])
                    ch = (min(bb[3], d["VH"]) - max(bb[1], 0)) / (sf["y1"] - sf["y0"])
                res.append({"id": s["id"], "step": lab, "t": round(t, 2),
                            "minpx": min(sz) if sz else None, "medpx": statistics.median(sz) if sz else None,
                            "small": [f"{x['t']}:{x['px']}" for x in main_t if x["px"] < MIN_PX][:8],
                            "navmin": min([x["px"] for x in d["texts"] if x["nav"]], default=None),
                            "cover_w": round(cw, 2), "cover_h": round(ch, 2), "bb": [round(v) for v in bb] if bb else None,
                            "blurred": d["blurred"], "emptyPill": d["emptyPill"], "skel": d["skel"]})
        br.close()
    if a.json:
        json.dump(res, open(a.json, "w"), ensure_ascii=False, indent=1)
    for r in res:
        f = []
        if r["small"]: f.append("小字 " + " ".join(r["small"][:4]))
        if r["step"] == "末" and (r["cover_w"] < COVER_W or r["cover_h"] < COVER_H): f.append(f"偏空 宽{r['cover_w']} 高{r['cover_h']} 外框{r['bb']}")
        if r["step"] == "末" and r["blurred"]: f.append(f"残留模糊 {r['blurred']}")
        if r["emptyPill"]: f.append(f"空胶囊 {r['emptyPill']}")
        if r["skel"] >= SKEL_WARN: f.append(f"骨架条 {r['skel']}")
        if r["navmin"] is not None and r["navmin"] < NAV_MIN_PX: f.append(f"导航字小 {r['navmin']}")
        if f:
            print(f"{r['id']} {r['step']} {r['t']}s  " + " | ".join(f))
    ends = [r for r in res if r["step"] == "末"]
    print(f"\n场景 {len(ends)}（结尾帧汇总）")
    print(f"  主体文字 <{MIN_PX}px：{sum(1 for r in ends if r['small'])}")
    print(f"  偏空（宽 <{COVER_W:.0%} 或高 <{COVER_H:.0%}）：{sum(1 for r in ends if r['cover_w'] < COVER_W or r['cover_h'] < COVER_H)}")
    print(f"  残留模糊：{sum(1 for r in ends if r['blurred'])}   空胶囊：{sum(1 for r in ends if r['emptyPill'])}   骨架条 ≥{SKEL_WARN}：{sum(1 for r in ends if r['skel'] >= SKEL_WARN)}")
    nm = [r["navmin"] for r in ends if r["navmin"] is not None]
    print(f"  常驻导航最小字号：{min(nm) if nm else '—'}（要求 ≥{NAV_MIN_PX}px）")


if __name__ == "__main__":
    main()
