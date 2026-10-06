#!/usr/bin/env python3
"""分镜审阅页：逐场景显示视觉命题、对象、构图、状态序列与参考，跟着 MP3 播放并逐步点亮，给用户审。

用法：python3 build_storyboard.py --scenes 项目/schematic/scenes.json --srt 字幕.srt --mp3 配音.mp3 --out 项目/分镜审阅.html
"""
import argparse, json, os, sys
from common import ASSETS, load_scenes, mp3_duration, parse_srt, rel, validate


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", required=True)
    ap.add_argument("--srt", required=True)
    ap.add_argument("--mp3", required=True)
    ap.add_argument("--out", required=True)
    a = ap.parse_args()
    d = load_scenes(a.scenes)
    subs = parse_srt(a.srt)
    errors, warns = validate(d["scenes"], subs)
    if errors:
        sys.exit("\n".join(["场景划分有错误，未生成："] + errors))
    data = dict(title=d.get("title", ""), rules=d.get("rules", {}), scenes=d["scenes"],
                subs={str(k): v for k, v in subs.items()}, total=mp3_duration(a.mp3))
    tpl = open(os.path.join(ASSETS, "storyboard.html"), encoding="utf-8").read()
    html = (tpl.replace("__DATA__", json.dumps(data, ensure_ascii=False))
               .replace("__TITLE__", d.get("title", "未命名")).replace("__AUDIO__", rel(a.out, a.mp3)))
    open(a.out, "w", encoding="utf-8").write(html)
    durs = [subs[s["b"]][1] - subs[s["a"]][0] for s in d["scenes"]]
    print(f"已生成 {a.out}：{len(durs)} 个场景，平均 {sum(durs) / len(durs):.1f} 秒，最短 {min(durs):.1f} 秒，最长 {max(durs):.1f} 秒")
    if warns:
        print("节奏提醒：" + "；".join(warns))


if __name__ == "__main__":
    main()
