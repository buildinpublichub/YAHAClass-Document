#!/usr/bin/env python3
"""第 7 步：把成片网页渲染成 4K 视频（用户确认样片后，在对话里要求渲染时执行）。

用法：python3 render.py --html 项目/成片网页.html --mp3 配音.mp3 --out 项目/成片_4K.mp4
可选：--fps 30（默认）  --scale 2（横版 3840×2160、竖版 2160×3840；1 = 1080p）  --seconds 8（只渲前 N 秒做测试）  --workers 8

原理：画面完全由时间算出，所以按帧号精确定位、逐帧截图，多进程分段并行编码，
     最后拼接并混入 MP3（从 0 秒对齐）。不是实时录屏，不会掉帧或音画错位。
"""
import argparse, math, os, pathlib, shutil, subprocess, sys, threading, time
from common import mp3_duration, page_size


def worker(url, a, b, fps, scale, seg, W, H):
    from playwright.sync_api import sync_playwright
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", str(fps),
                           "-c:v", "mjpeg", "-i", "-", "-c:v", "libx264", "-preset", "fast", "-crf", "14",
                           "-pix_fmt", "yuv420p", "-r", str(fps), seg], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": W, "height": H}, device_scale_factor=scale)
        pg.goto(url)
        pg.wait_for_function("window.__ready !== undefined")
        pg.evaluate("window.__ready")
        for i in range(a, b):
            pg.evaluate("t => window.__frame(t)", i / fps)
            ff.stdin.write(pg.screenshot(type="jpeg", quality=95))
            if (i - a) % 10 == 9 or i == b - 1:
                print("P", i - a + 1, flush=True)
        br.close()
    ff.stdin.close()
    ff.wait()
    sys.exit(ff.returncode)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--html", required=True)
    ap.add_argument("--mp3", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--scale", type=int, default=2)
    ap.add_argument("--seconds", type=float, default=0)
    ap.add_argument("--workers", type=int, default=max(2, min(8, (os.cpu_count() or 4) - 4)))
    a = ap.parse_args()

    url = pathlib.Path(a.html).resolve().as_uri() + "?render=1"
    W, H = page_size(a.html)
    dur = a.seconds or mp3_duration(a.mp3)
    total = math.ceil(dur * a.fps)
    tmp = os.path.join(os.path.dirname(os.path.abspath(a.out)), ".render_tmp")
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    n = min(a.workers, total)
    bounds = [round(total * k / n) for k in range(n + 1)]
    done, t0 = [0] * n, time.time()
    print(f"渲染 {W * a.scale}×{H * a.scale} @ {a.fps}fps，共 {total} 帧，{n} 个进程并行", flush=True)

    def watch(k, proc):
        for line in proc.stdout:
            if line.startswith("P "):
                done[k] = int(line.split()[1])

    procs, segs = [], []
    for k in range(n):
        seg = os.path.join(tmp, f"seg{k:02d}.mp4")
        segs.append(seg)
        pr = subprocess.Popen([sys.executable, os.path.abspath(__file__), "worker", url, str(bounds[k]),
                               str(bounds[k + 1]), str(a.fps), str(a.scale), seg, str(W), str(H)], stdout=subprocess.PIPE, text=True)
        threading.Thread(target=watch, args=(k, pr), daemon=True).start()
        procs.append(pr)
    last = 0
    while any(pr.poll() is None for pr in procs):
        time.sleep(1)
        d = sum(done)
        if time.time() - last > 15 and d:
            el = time.time() - t0
            print(f"  {d}/{total} 帧（{d / total:.0%}），剩余约 {el / d * (total - d) / 60:.1f} 分钟", flush=True)
            last = time.time()
    if any(pr.returncode for pr in procs):
        sys.exit("有渲染进程失败，见上方报错")

    lst = os.path.join(tmp, "list.txt")
    with open(lst, "w") as f:
        f.writelines(f"file '{s}'\n" for s in segs)
    subprocess.check_call(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                           "-t", f"{dur:.3f}", "-i", a.mp3, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                           "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", a.out])
    shutil.rmtree(tmp, ignore_errors=True)
    print(f"完成：{a.out}（用时 {(time.time() - t0) / 60:.1f} 分钟）")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "worker":
        worker(sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5]), int(sys.argv[6]), sys.argv[7],
               int(sys.argv[8]), int(sys.argv[9]))
    else:
        main()
