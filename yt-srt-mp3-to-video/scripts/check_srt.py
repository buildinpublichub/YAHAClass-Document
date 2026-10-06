#!/usr/bin/env python3
"""第 1 步：核对 SRT 与 MP3。

用法：python3 check_srt.py 字幕.srt 配音.mp3
检查：句数、总时长是否一致、时间轴重叠、句间停顿（决定转场能用多长）。
"""
import sys
from common import parse_srt, mp3_duration


def main(srt, mp3):
    subs = parse_srt(srt)
    dur = mp3_duration(mp3)
    keys = sorted(subs)
    last_end = subs[keys[-1]][1]
    print(f"字幕 {len(subs)} 句；最后一句结束于 {last_end:.3f}s；MP3 时长 {dur:.3f}s；差值 {dur - last_end:+.3f}s")
    if keys != list(range(keys[0], keys[0] + len(keys))):
        print("⚠ 字幕序号不连续")
    prev, gaps, bad = 0.0, [], []
    for n in keys:
        st, en, _ = subs[n]
        if st < prev - 0.001:
            bad.append(n)
        if en < st:
            bad.append(n)
        gaps.append((round(st - prev, 3), n))
        prev = en
    if bad:
        print(f"⚠ 时间轴重叠或倒序：#{bad[:15]}")
    if last_end > dur + 0.05:
        print("⚠ 字幕比音频长：SRT 可能和这个 MP3 不对应，先修正再继续")
    elif dur - last_end > 3:
        print("⚠ 音频比字幕长 3 秒以上：确认结尾是否有未转写的内容")
    big = sorted(gaps, reverse=True)[:5]
    print("最长的句间停顿：" + "，".join(f"#{n} 前 {g:.2f}s" for g, n in big))
    print("提示：转场时长要小于大多数停顿（通常约 0.3s），不要把转场压在话说到一半的地方。")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
