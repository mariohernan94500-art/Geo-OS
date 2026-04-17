from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from collections import defaultdict

app = FastAPI()

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Start scanning in a safe area by default
BASE_DIR = os.path.expanduser("~") 

@app.get("/scan")
def scan_files(folder: str = "Desktop"):
    target_path = os.path.join(BASE_DIR, folder)
    if not os.path.exists(target_path):
        return {"error": "Path not found", "path": target_path}

    files = []
    # Limit depth or specific folders for performance
    try:
        import time
        import mimetypes
        
        for root, dirs, filenames in os.walk(target_path):
            if ".git" in root or "node_modules" in root:
                continue
                
            for f in filenames:
                path = os.path.join(root, f)
                try:
                    stats = os.stat(path)
                    size_kb = round(stats.st_size / 1024, 2)
                    c_time = time.ctime(stats.st_ctime)
                    m_time = time.ctime(stats.st_mtime)
                    ext = f.split('.')[-1].lower() if '.' in f else 'unknown'
                    
                    # Tipo real inferido
                    mime, _ = mimetypes.guess_type(path)
                    real_type = "document"
                    if mime:
                        if "image" in mime: real_type = "image"
                        elif "audio" in mime or "video" in mime: real_type = "media"
                        elif "text" in mime: real_type = "code_text"
                    
                    files.append({
                        "id": path,
                        "name": f,
                        "path": path,
                        "size_kb": size_kb,
                        "extension": ext,
                        "real_type": real_type,
                        "created_at": c_time,
                        "modified_at": m_time,
                        "status": "unclassified"
                    })
                except OSError:
                    continue
            
            if len(files) > 1000: break # Safety limit 
    except Exception as e:
        return {"error": str(e)}
    
    return {"files": files}

@app.get("/organize")
def organize_by_type(folder: str = "Desktop"):
    target_path = os.path.join(BASE_DIR, folder)
    categories = defaultdict(list)

    for root, dirs, filenames in os.walk(target_path):
        for f in filenames:
            ext = f.split('.')[-1] if '.' in f else 'no_ext'
            categories[ext].append(f)
    
    return {"organized": categories}

@app.get("/read")
def read_file(path: str):
    try:
        if os.path.getsize(path) > 1024 * 1024:
            return {"content": "File too large to preview."}
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            return {"content": f.read()}
    except Exception as e:
        return {"error": str(e)}
