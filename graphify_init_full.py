import sys, json, subprocess
from pathlib import Path

out = Path("graphify-out")
out.mkdir(exist_ok=True)
(out / ".graphify_python").write_text(sys.executable, encoding="utf-8")
cwd_path = Path.cwd()
(out / ".graphify_root").write_text(str(cwd_path), encoding="utf-8")

# detect
from graphify.detect import detect
result = detect(cwd_path)
(out / ".graphify_detect.json").write_text(json.dumps(result, ensure_ascii=False), encoding="utf-8")
print("Detect finished")
