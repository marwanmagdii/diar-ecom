import sys, json, glob
from pathlib import Path

# B3
chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
all_nodes, all_edges, all_hyperedges = [], [], []
for c in chunks:
    d = json.loads(Path(c).read_text(encoding="utf-8"))
    all_nodes += d.get('nodes', [])
    all_edges += d.get('edges', [])
    all_hyperedges += d.get('hyperedges', [])

Path('graphify-out/.graphify_semantic_new.json').write_text(json.dumps({
    'nodes': all_nodes, 'edges': all_edges, 'hyperedges': all_hyperedges,
    'input_tokens': 0, 'output_tokens': 0,
}, ensure_ascii=False), encoding="utf-8")

from graphify.cache import save_semantic_cache
saved = save_semantic_cache(all_nodes, all_edges, all_hyperedges, root='.')
cached = json.loads(Path('graphify-out/.graphify_cached.json').read_text(encoding="utf-8")) if Path('graphify-out/.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
all_nodes += cached.get('nodes', [])
all_edges += cached.get('edges', [])
all_hyperedges += cached.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged = {'nodes': deduped, 'edges': all_edges, 'hyperedges': all_hyperedges, 'input_tokens': 0, 'output_tokens': 0}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(merged, ensure_ascii=False), encoding="utf-8")

# MERGE
ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding="utf-8"))
final = {
    'nodes': ast.get('nodes', []) + merged.get('nodes', []),
    'edges': ast.get('edges', []) + merged.get('edges', []),
    'hyperedges': ast.get('hyperedges', []) + merged.get('hyperedges', []),
    'input_tokens': ast.get('input_tokens', 0) + merged.get('input_tokens', 0),
    'output_tokens': ast.get('output_tokens', 0) + merged.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(final, ensure_ascii=False), encoding="utf-8")

# STEP 4
import graphify_step4

# STEP 5
import graphify_step5

# STEP 6
print("Generating HTML...")
from graphify.export import export_html
export_html('graphify-out/graph.json', 'graphify-out/graph.html', title=".")

# STEP 9
import graphify_step9
