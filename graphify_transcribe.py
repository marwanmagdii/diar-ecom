import json, os, sys
from pathlib import Path
from graphify.transcribe import transcribe_all

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding="utf-8"))
video_files = detect.get('files', {}).get('video', [])
prompt = "E-commerce platform UI tests recording. Use proper punctuation and paragraph breaks."

os.environ['GRAPHIFY_WHISPER_PROMPT'] = prompt
os.environ['GRAPHIFY_WHISPER_MODEL'] = 'base'

transcript_paths = transcribe_all(video_files, initial_prompt=prompt)
Path('graphify-out/.graphify_transcripts.json').write_text(json.dumps(transcript_paths, ensure_ascii=False), encoding="utf-8")
print(f"Transcribed {len(transcript_paths)} file(s)", file=sys.stderr)
