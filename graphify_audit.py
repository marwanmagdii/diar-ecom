import json
from pathlib import Path
from collections import defaultdict

data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
nodes = {n['id']: n for n in data['nodes']}
edges = data.get('links', [])

# Build adjacency
adj = defaultdict(list)
for e in edges:
    adj[e['source']].append(e['target'])
    adj[e['target']].append(e['source'])

# 1. Security & Separation of Concerns
# Look for UI components connected to admin contexts
admin_nodes = [n for n in nodes.values() if 'admin' in n['id'].lower() or 'admin' in n.get('label', '').lower()]
admin_ids = {n['id'] for n in admin_nodes}
security_flags = []
for e in edges:
    src, tgt = e['source'], e['target']
    src_node = nodes.get(src)
    tgt_node = nodes.get(tgt)
    if not src_node or not tgt_node: continue
    
    src_is_ui = ('pages' in src_node['id'] and 'admin' not in src_node['id']) or ('components' in src_node['id'] and 'admin' not in src_node['id'])
    tgt_is_admin = tgt in admin_ids
    
    if src_is_ui and tgt_is_admin:
        security_flags.append(f"{src_node['label']} -> {tgt_node['label']}")
        
    tgt_is_ui = ('pages' in tgt_node['id'] and 'admin' not in tgt_node['id']) or ('components' in tgt_node['id'] and 'admin' not in tgt_node['id'])
    src_is_admin = src in admin_ids
    
    if tgt_is_ui and src_is_admin:
        security_flags.append(f"{tgt_node['label']} -> {src_node['label']}")

# 2. Architectural Bottlenecks (God Nodes)
degree = {nid: len(neighbors) for nid, neighbors in adj.items()}
god_nodes = sorted(degree.items(), key=lambda x: x[1], reverse=True)[:5]
god_nodes_info = [(nodes[nid]['label'], count) for nid, count in god_nodes]

# 3. Dead Code & Disconnected Logic
dead_code = [nodes[nid]['label'] for nid, count in degree.items() if count <= 1 and 'Schema' not in nodes[nid]['label'] and 'handler' not in nodes[nid]['label']]
schemas = [nodes[nid]['label'] for nid, count in degree.items() if count <= 1 and 'Schema' in nodes[nid]['label']]
handlers = [nodes[nid]['label'] for nid, count in degree.items() if count <= 1 and 'handler' in nodes[nid]['label']]

report = {
    'security_flags': list(set(security_flags)),
    'god_nodes': god_nodes_info,
    'dead_code': dead_code[:15],
    'schemas': schemas[:10],
    'handlers': handlers[:15],
    'total_nodes': len(nodes),
    'total_edges': len(edges)
}

Path('graphify-out/audit_results.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print("Audit analysis complete")
