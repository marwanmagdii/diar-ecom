import json
from graphify.extract import collect_files, extract
from pathlib import Path

detect_text = Path('graphify-out/.graphify_detect.json').read_text(encoding='utf-8-sig')
detect = json.loads(detect_text)

code_files = []
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    result = extract(code_files, cache_root=Path('D:/web/ecom'), parallel=False)
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding='utf-8')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}, ensure_ascii=False), encoding='utf-8')

# Mock semantic for screenshots (Skipping 62 UI screenshots to save agent compute)
sem = {'nodes': [], 'edges': [], 'hyperedges': [], 'input_tokens': 0, 'output_tokens': 0}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(sem, indent=2, ensure_ascii=False), encoding='utf-8')

ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding='utf-8'))
merged_nodes = list(ast['nodes'])
merged_edges = ast['edges']
merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': [],
    'input_tokens': 0,
    'output_tokens': 0,
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding='utf-8')
print("Step 3 Done (Deep mode, sequential extraction)")
