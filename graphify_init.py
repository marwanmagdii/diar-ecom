import sys
import json
from pathlib import Path
import subprocess

out_dir = Path('graphify-out')
out_dir.mkdir(exist_ok=True)
(out_dir / '.graphify_python').write_text(sys.executable, encoding='utf-8')
(out_dir / '.graphify_root').write_text(str(Path.cwd()), encoding='utf-8')

# Ensure graphifyy is installed
try:
    import graphify
except ImportError:
    subprocess.run([sys.executable, '-m', 'pip', 'install', 'graphifyy', '-q'])

# Run detect
from graphify.detect import detect
result = detect(Path.cwd())
(out_dir / '.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding='utf-8')
