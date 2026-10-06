#!/usr/bin/env python3
"""成片网页：示意动画引擎（暗色 / 亮色两种主题）+ 场景数据 + 场景构建代码 + 内嵌子集字体。

用法：python3 build_film.py --scenes 项目/schematic/scenes.json --js 项目/schematic/scenes.js \
         --srt 字幕.srt --mp3 配音.mp3 --out 项目/成片网页.html --theme dark|light [--aspect 9:16]
--theme：dark 暗色示意 / light 亮色（Gumroad 风格）。首次构建必须指定（用户没说就先问），之后记在 schematic/.lib/theme。
--js 可以给一个文件、多个文件（空格分隔）或一个目录（读取其中全部 .js，按文件名排序）。
每个文件各自封装作用域：文件里写 `const SCENES = {...}` 或 `Object.assign(SCENES, {...})` 都可以，文件内的辅助函数互不冲突。
长片按章节拆成 schematic/scenes/01-xxx.js、02-xxx.js…，可由多人 / 多个子代理并行编写。
竖版的场景构建约定写在 scenes-9x16.js 或 scenes-9x16/ 目录（场景划分 scenes.json 两版共用）。
音频以相对路径引用：成片网页和 MP3 的相对位置不能变（移动网页时一起移动）。

版本锁定：第一次构建时把 skill 的 engine.html 和 lib.js（组件库）复制到 项目/schematic/.lib/，
之后该项目一律使用这份副本，skill 更新不会改变旧项目的画面。要升级到 skill 的最新版本，加 --update-lib。
"""
import argparse, base64, hashlib, json, os, re, shutil, subprocess, sys
from common import ASSETS, load_scenes, mp3_duration, parse_srt, rel, validate

FONTS = [("NSC", "NotoSansSC[wght].ttf", True),        # 中英文：按用到的字做子集
         ("JBM", "JetBrainsMono[wght].ttf", False)]    # 终端与代码


def font_css(text, cache_dir):
    os.makedirs(cache_dir, exist_ok=True)
    chars = "".join(sorted(set(text))) + "".join(chr(c) for c in range(32, 127)) + "…·—“”‘’：；，。！？（）「」≥≠→←↑↓✓✕×%$€¥▮"
    key = hashlib.md5(chars.encode()).hexdigest()[:10]
    css = []
    for fam, src, sub in FONTS:
        out = os.path.join(cache_dir, f"{fam}-{key if sub else 'full'}.woff2")
        if not os.path.exists(out):
            cmd = ["pyftsubset", os.path.join(ASSETS, "fonts", src), "--flavor=woff2", "--layout-features=*",
                   "--output-file=" + out]
            if sub:
                txt = os.path.join(cache_dir, "chars.txt")
                open(txt, "w", encoding="utf-8").write(chars)
                cmd.append("--text-file=" + txt)
            else:
                cmd.append("--unicodes=U+0020-007E,U+00A0-00FF,U+2010-2027,U+2190-21FF,U+2260,U+2265,U+2580-259F")
            subprocess.check_call(cmd)
        b = base64.b64encode(open(out, "rb").read()).decode()
        css.append(f'@font-face{{font-family:"{fam}";src:url(data:font/woff2;base64,{b}) format("woff2");'
                   f'font-weight:100 900;font-display:block}}')
    return "\n".join(css)


def built_ids(js, scenes):
    """scenes.js 里 SCENES 的键覆盖了哪些场景（考虑 span）"""
    order = [s["id"] for s in scenes]
    cov = set()
    for m in re.finditer(r"(?:^|[{,])\s*[\"']?([A-Za-z0-9_\-]+)[\"']?\s*:\s*\{(.{0,120})", js, re.M):
        sid, rest = m.group(1), m.group(2)
        if sid not in order:
            continue
        sp = re.search(r"span\s*:\s*(\d+)", rest)
        i = order.index(sid)
        cov.update(order[i:i + (int(sp.group(1)) if sp else 1)])
    return cov


def load_js(paths):
    """读取一个或多个场景构建文件（或目录），每个文件包进独立作用域后拼接"""
    files = []
    for p in paths:
        if os.path.isdir(p):
            files += sorted(os.path.join(p, f) for f in os.listdir(p) if f.endswith(".js"))
        elif os.path.exists(p):
            files.append(p)
        else:
            sys.exit(f"找不到场景构建文件：{p}")
    parts, raw = [], []
    for f in files:
        js = open(f, encoding="utf-8").read()
        raw.append(js)
        js2 = re.sub(r"\bconst\s+SCENES\s*=", "SCENES_FILE =", js)
        parts.append(f"/* ---- {os.path.basename(f)} ---- */\n(()=>{{let SCENES_FILE={{}};\n{js2}\n;Object.assign(SCENES,SCENES_FILE);}})();")
    return "\n".join(parts), "\n".join(raw), files


def resolve_theme(lib_dir, want):
    """主题记在 .lib/theme：首次必须指定；之后不写就沿用；和记录不同时按新值改写并提醒"""
    f = os.path.join(lib_dir, "theme")
    old = open(f).read().strip() if os.path.exists(f) else None
    if want is None and old is None and ".stage.light" not in open(os.path.join(lib_dir, "engine.html"), encoding="utf-8").read():
        return "dark"  # 旧项目：锁定的引擎还没有亮色主题，一律按暗色
    if want is None:
        if old is None:
            sys.exit("请用 --theme dark（暗色）或 --theme light（亮色 · Gumroad 风格）指定主题；用户没说明时先问用户，不要自己选")
        return old
    if old and old != want:
        print(f"⚠ 主题从 {old} 改为 {want}：场景代码里如果写死了颜色，要重新截图检查")
    open(f, "w").write(want)
    return want


def locked_lib(scenes_path, update=False):
    """返回本项目使用的 (engine.html 路径, lib.js 路径)；首次或 --update-lib 时从 skill 复制"""
    d = os.path.join(os.path.dirname(os.path.abspath(scenes_path)), ".lib")
    eng, lib = os.path.join(d, "engine.html"), os.path.join(d, "lib.js")
    if update or not os.path.exists(eng):
        os.makedirs(d, exist_ok=True)
        shutil.copy(os.path.join(ASSETS, "engine.html"), eng)
        src = os.path.join(ASSETS, "lib.js")
        if os.path.exists(src):
            shutil.copy(src, lib)
        elif os.path.exists(lib):
            os.remove(lib)
        print(f"已{'更新' if update else '锁定'}引擎与组件库版本：{d}")
    return eng, lib


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scenes", required=True)
    ap.add_argument("--js", nargs="*", default=[])
    ap.add_argument("--srt", required=True)
    ap.add_argument("--mp3", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--aspect", default="16:9", choices=["16:9", "9:16"])
    ap.add_argument("--theme", choices=["dark", "light"], help="画面主题：dark 暗色示意 / light 亮色（Gumroad 风格）。首次构建必须指定，之后记在 .lib/theme，不写沿用")
    ap.add_argument("--update-lib", action="store_true", help="把本项目锁定的引擎与组件库更新为 skill 的最新版本")
    a = ap.parse_args()

    d = load_scenes(a.scenes)
    scenes = d["scenes"]
    subs = parse_srt(a.srt)
    errors, warns = validate(scenes, subs)
    if errors:
        sys.exit("\n".join(["场景划分有错误，未生成："] + errors))
    js, raw, files = load_js(a.js)
    missing = [s["id"] for s in scenes if s["id"] not in built_ids(raw, scenes)]
    data = dict(subs={str(k): v for k, v in subs.items()}, scenes=scenes, total=mp3_duration(a.mp3),
                aspect=a.aspect, title=d.get("title", ""))
    eng, lib = locked_lib(a.scenes, a.update_lib)
    theme = resolve_theme(os.path.dirname(eng), a.theme)
    data["theme"] = theme
    tpl = open(eng, encoding="utf-8").read()
    if os.path.exists(lib):  # 组件库：全局函数，先于场景构建文件载入
        js = "/* ---- lib.js（组件库） ---- */\n" + open(lib, encoding="utf-8").read() + "\n" + js
    html = (tpl.replace("__SCENES__", js).replace("__DATA__", json.dumps(data, ensure_ascii=False))
               .replace("__TITLE__", d.get("title", "未命名")).replace("__AUDIO__", rel(a.out, a.mp3))
               .replace("__SIZE__", "1080x1920" if a.aspect == "9:16" else "1920x1080"))
    cache = os.path.join(os.path.dirname(os.path.abspath(a.scenes)), ".cache")
    html = html.replace("__FONTS__", font_css(html, cache))
    # 清理旧的中文字体子集缓存（每次改文字都会生成新的一份）
    keep = set(re.findall(r"NSC-[0-9a-f]{10}\.woff2", " ".join(os.listdir(cache))))
    newest = max((os.path.join(cache, k) for k in keep), key=os.path.getmtime, default=None)
    for k in keep:
        f = os.path.join(cache, k)
        if f != newest:
            os.remove(f)
    open(a.out, "w", encoding="utf-8").write(html)
    print(f"已生成 {a.out}（{len(html) // 1024} KB）：{len(scenes)} 个场景，画面 {a.aspect}，主题 {'亮色（Gumroad）' if theme == 'light' else '暗色'}，场景构建文件 {len(files)} 个")
    if missing:
        print(f"⚠ 还有 {len(missing)} 个场景没有构建（成片里显示红字占位）：" + "、".join(missing))
    if warns:
        print("节奏提醒：" + "；".join(warns))


if __name__ == "__main__":
    main()
