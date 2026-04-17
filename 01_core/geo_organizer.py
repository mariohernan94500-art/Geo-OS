import os
import shutil
import csv
import datetime

# Carpeta Maestra GEO-FILE (OneDrive / Project Core)
BASE_DIR = r"c:/Users/conta/OneDrive/Desktop/Geo Core/Geo-File"
if not os.path.exists(BASE_DIR):
    os.makedirs(BASE_DIR)

CATEGORIES = {
    "Imagenes": [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp", ".raw"],
    "Documentos": [".pdf", ".docx", ".txt", ".md", ".pptx", ".xlsx", ".odt", ".epub"],
    "Codigo": [".py", ".js", ".html", ".css", ".json", ".cpp", ".java", ".go", ".rs"],
    "Archivos_Data": [".csv", ".sql", ".db", ".yaml", ".yml", ".xml"],
    "Multimedia": [".mp4", ".mov", ".avi", ".mkv", ".mp3", ".wav", ".flac"],
    "Comprimidos": [".zip", ".rar", ".7z", ".tar", ".gz"]
}

def get_file_info(path):
    try:
        size = os.path.getsize(path)
        ext = os.path.splitext(path)[1].lower()
        return {"size": round(size/1024, 2), "ext": ext}
    except: return {"size": 0, "ext": "unk"}

def pre_scan():
    if not os.path.exists(BASE_DIR): return {"files": [], "stats": {"total_size_mb": 0, "total_files": 0, "types": {}}}
    
    pending = []
    total_size = 0
    type_counts = {}
    
    # Update Code extension dynamically
    if ".tsx" not in CATEGORIES["Codigo"]:
        CATEGORIES["Codigo"].extend([".tsx", ".jsx", ".ts", ".js"])
    
    for root, dirs, filenames in os.walk(BASE_DIR):
        for f in filenames:
            path = os.path.join(root, f)
            info = get_file_info(path)
            
            relative_root = os.path.relpath(root, BASE_DIR)
            ext = info["ext"]
            
            target_cat = "Otros"
            for category, extensions in CATEGORIES.items():
                if ext in extensions: 
                    target_cat = category
                    break
            
            # Si el archivo ya está en la categoría correcta, no lo contamos como pendiente de ordenar
            if relative_root == target_cat:
                continue

            size = info["size"]
            total_size += size
            type_counts[target_cat] = type_counts.get(target_cat, 0) + 1
            
            pending.append({
                "name": f,
                "size_kb": size,
                "type": ext,
                "target": target_cat,
                "current": relative_root
            })
            
    return {
        "files": pending[:300], # Mandamos top 300 para no matar el UI
        "stats": {
            "total_size_mb": round(total_size / 1024, 2),
            "total_files": len(pending),
            "types": type_counts
        }
    }

def organize_files():
    if not os.path.exists(BASE_DIR):
        try: os.makedirs(BASE_DIR)
        except: return {"error": "Permisos denegados"}

    report = []
    try:
        # Caminar recursivamente por todas las subcarpetas
        for root, dirs, filenames in os.walk(BASE_DIR):
            for filename in filenames:
                file_path = os.path.join(root, filename)
                
                # Evitar mover archivos que ya están en su carpeta destino correcta
                relative_root = os.path.relpath(root, BASE_DIR)
                
                info = get_file_info(file_path)
                ext = info["ext"]

                for category, extensions in CATEGORIES.items():
                    # Añadir soporte para React (.tsx, .jsx) si no estaban
                    if category == "Codigo":
                        extensions.extend([".tsx", ".jsx", ".ts"])
                    
                    if ext in extensions:
                        target_dir = os.path.join(BASE_DIR, category)
                        if not os.path.exists(target_dir): os.makedirs(target_dir)

                        # Si el archivo ya está en la carpeta correcta, no lo movemos
                        if relative_root == category:
                            continue

                        new_path = os.path.join(target_dir, filename)
                        if os.path.exists(new_path):
                            base, extension = os.path.splitext(filename)
                            new_path = os.path.join(target_dir, f"{base}_sync_{extension}")

                        shutil.move(file_path, new_path)
                        
                        # Escribir en el archivo Excel / CSV
                        csv_path = os.path.join(r"c:/Users/conta/OneDrive/Desktop/Geo Core", "auditoria_geo_core.csv")
                        file_exists = os.path.isfile(csv_path)
                        
                        with open(csv_path, 'a', newline='', encoding='utf-8-sig') as csvfile:
                            writer = csv.writer(csvfile, delimiter=';')
                            if not file_exists:
                                writer.writerow(["Fecha_Operacion", "Nombre_Documento", "Peso_MB", "Ubicacion_Antigua", "Ubicacion_Nueva", "De_Que_Trataba", "Mejora_Aplicada"])
                            
                            writer.writerow([
                                datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                filename,
                                round(info["size"]/1024, 2),
                                relative_root,
                                category,
                                "Categorizado vía motor de extensión (Pre-Token)",
                                "Reestructuración táctica y aislamiento de entorno"
                            ])

                        report.append({
                            "file": filename,
                            "from": relative_root,
                            "to": category,
                            "status": "success"
                        })
                        break
    except Exception as e:
        return {"error": str(e)}

    return report

if __name__ == "__main__":
    result = organize_files()
    print("Execution complete. Nodes moved:", len(result))
