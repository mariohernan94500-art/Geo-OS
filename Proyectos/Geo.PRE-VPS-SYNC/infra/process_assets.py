import os
from PIL import Image

# Configuración de rutas
# El script está en Proyectos/Geo/infra/process_assets.py
# Subimos 4 niveles para llegar a la raíz del workspace (/home/mario/Escritorio/Geo)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "..", ".."))

SOURCE_LOGO = os.path.join(BASE_DIR, "Ideas", "GEO_OS_Logo_v1.png")
OUTPUT_DIR = os.path.join(BASE_DIR, "Proyectos", "Geo", "infra", "store-assets")
BACKGROUND_COLOR = (10, 10, 10)  # #0a0a0a (Estética Geo OS)

def process_assets():
    if not os.path.exists(SOURCE_LOGO):
        print(f"❌ Error: No se encuentra el logo fuente en {SOURCE_LOGO}")
        return

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"📁 Directorio creado: {OUTPUT_DIR}")

    try:
        with Image.open(SOURCE_LOGO) as img:
            print(f"🎨 Procesando logo fuente: {SOURCE_LOGO}")
            
            # 1. Icon 512x512 (Play Store)
            # Redimensionar manteniendo proporción y centrar en fondo cuadrado
            icon = img.copy()
            icon.thumbnail((512, 512), Image.Resampling.LANCZOS)
            
            final_icon = Image.new("RGBA", (512, 512), BACKGROUND_COLOR + (255,))
            offset = ((512 - icon.width) // 2, (512 - icon.height) // 2)
            final_icon.paste(icon, offset, icon if icon.mode == 'RGBA' else None)
            final_icon.save(os.path.join(OUTPUT_DIR, "icon-512.png"), "PNG")
            print("✅ Generado: icon-512.png")

            # 2. Feature Graphic 1024x500
            # Centrar el logo en un canvas de 1024x500
            feature = img.copy()
            feature.thumbnail((400, 400), Image.Resampling.LANCZOS) # Logo un poco más pequeño para el banner
            
            final_feature = Image.new("RGBA", (1024, 500), BACKGROUND_COLOR + (255,))
            offset = ((1024 - feature.width) // 2, (500 - feature.height) // 2)
            final_feature.paste(feature, offset, feature if feature.mode == 'RGBA' else None)
            final_feature.save(os.path.join(OUTPUT_DIR, "feature-graphic.png"), "PNG")
            print("✅ Generado: feature-graphic.png")

            # 3. Adaptive Icon Foreground 432x432
            # El logo debe estar contenido en el centro (safe zone)
            adaptive = img.copy()
            adaptive.thumbnail((250, 250), Image.Resampling.LANCZOS) # Zona segura central
            
            # El foreground suele ser transparente para que el sistema use el fondo definido en app.json
            final_adaptive = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
            offset = ((432 - adaptive.width) // 2, (432 - adaptive.height) // 2)
            final_adaptive.paste(adaptive, offset, adaptive if adaptive.mode == 'RGBA' else None)
            final_adaptive.save(os.path.join(OUTPUT_DIR, "adaptive-foreground.png"), "PNG")
            print("✅ Generado: adaptive-foreground.png")

            print(f"\n🚀 ¡Proceso completado! Archivos listos en: {OUTPUT_DIR}")

    except Exception as e:
        print(f"❌ Error durante el procesamiento: {e}")

if __name__ == "__main__":
    process_assets()
