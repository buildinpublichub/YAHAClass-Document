"""yt-srt-mp3-to-video 共用函数：读取 SRT / MP3 / scenes.json，校验场景划分。"""
import json, os, re, subprocess

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(SKILL, "assets")
# 从 Finder 或精简环境启动时补上 Homebrew 路径，确保找得到 ffmpeg / ffprobe / pyftsubset
os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:" + os.environ.get("PATH", "")

SCENE_MIN, SCENE_MAX = 3.0, 30.0        # 场景时长的常见范围（秒）；超出只提醒，不报错


def _ts(x):
    h, m, r = x.strip().split(":")
    a, b = r.replace(".", ",").split(",")
    return int(h) * 3600 + int(m) * 60 + int(a) + int(b) / 1000


def parse_srt(path):
    """返回 {序号: [开始秒, 结束秒, 文本]}"""
    subs = {}
    raw = open(path, encoding="utf-8-sig").read().replace("\r\n", "\n").strip()
    for blk in re.split(r"\n\s*\n(?=\d+\s*\n)", raw):
        L = [x for x in blk.split("\n") if x.strip() != ""]
        if len(L) < 2 or "-->" not in L[1]:
            continue
        st, en = [_ts(x) for x in L[1].split("-->")]
        subs[int(L[0])] = [round(st, 3), round(en, 3), " ".join(x.strip() for x in L[2:]).strip()]
    return subs


def mp3_duration(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                                   "-of", "csv=p=0", path])
    return round(float(out.strip()), 3)


def load_scenes(path):
    """读取 scenes.json，返回整个字典；场景按顺序编号 no（从 1 开始）"""
    d = json.load(open(path, encoding="utf-8"))
    for i, s in enumerate(d["scenes"], 1):
        s["no"] = i
        s.setdefault("name", s["id"])
    return d


def validate(scenes, subs):
    """检查：字幕按顺序、不重不漏地分进各场景；场景 id 唯一。返回 (错误, 提醒)"""
    errors, warns = [], []
    ids = [s["id"] for s in scenes]
    dup_ids = sorted({i for i in ids if ids.count(i) > 1})
    if dup_ids:
        errors.append(f"场景 id 重复：{dup_ids}")
    for s in scenes:
        if s["a"] not in subs or s["b"] not in subs:
            errors.append(f"场景 {s['id']} 引用了不存在的字幕 #{s['a']}–{s['b']}")
    if errors:
        return errors, warns
    seq = [i for s in scenes for i in range(s["a"], s["b"] + 1)]
    want = sorted(subs)
    if seq != want:
        miss = sorted(set(want) - set(seq))
        dup = sorted({i for i in seq if seq.count(i) > 1})
        errors.append(f"字幕覆盖有误：缺少 {miss[:12]}，重复 {dup[:12]}，或顺序不对")
        return errors, warns
    for s in scenes:
        dur = subs[s["b"]][1] - subs[s["a"]][0]
        if dur < SCENE_MIN:
            warns.append(f"{s['id']} 只有 {dur:.1f} 秒，确认是否应与相邻场景合并")
        elif dur > SCENE_MAX:
            warns.append(f"{s['id']} 长达 {dur:.1f} 秒，确认是否应按语义拆成几个相连场景")
        for k in ("prop", "sequence"):
            if not s.get(k):
                errors.append(f"场景 {s['id']} 缺少 {k}")
        for step in s.get("sequence", []):
            if step.get("at") is not None and not s["a"] <= step["at"] <= s["b"]:
                errors.append(f"场景 {s['id']} 的步骤时间 #{step['at']} 不在本场景字幕 #{s['a']}–{s['b']} 内")
            elif step.get("at") is not None and step.get("dt"):
                t = subs[step["at"]][0] + step["dt"]
                if t > subs[s["b"]][1] + 0.5:
                    errors.append(f"场景 {s['id']} 的步骤 #{step['at']}+{step['dt']}s 超出了场景结束时间")
    return errors, warns


def rel(from_file, target):
    """HTML 里引用音频用的相对路径"""
    return os.path.relpath(target, os.path.dirname(os.path.abspath(from_file)))


def page_size(html_path):
    """从成片网页的 <meta name="stage-size"> 读出画面尺寸 (宽, 高)，默认 1920×1080"""
    head = open(html_path, encoding="utf-8").read(4000)
    m = re.search(r'name="stage-size" content="(\d+)x(\d+)"', head)
    return (int(m.group(1)), int(m.group(2))) if m else (1920, 1080)
