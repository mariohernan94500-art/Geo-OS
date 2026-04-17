# Banner Generator — Componente GEO

Generador de banners animados con red neuronal para campañas, encuestas, YouTube y redes sociales.

## Ubicación en GEO
```
GEO/05_frontend/components/banner-generator/
├── banner-ia.html    ← archivo principal
└── README.md         ← este archivo
```

## Cómo usarlo
Abrir `banner-ia.html` en el navegador. No requiere servidor ni instalación.

## Qué puedes cambiar desde la interfaz
- Texto principal y subtítulo
- Colores de fondo (izquierda y derecha del gradiente)
- Color de partículas y conexiones
- Color del texto principal y subtítulo
- Tamaño de fuente
- Cantidad de partículas
- Alto del banner

## Presets incluidos
| Preset | Uso |
|--------|-----|
| Español | Encuesta IA en español |
| Français | Encuesta IA en francés |
| Personalizado | Plantilla verde/teal para otros usos |

## Cómo agregar un nuevo preset
En el archivo `banner-ia.html`, buscar el objeto `PRESETS` y agregar:

```javascript
mi_preset: {
    main: 'Tu texto principal aquí',
    sub: 'Tu subtítulo · Mario Guillaume',
    color1: '#0f172a',
    color2: '#134e4a',
    particle: '#14b8a6',
    textcolor: '#ffffff',
    subcolor: '#99f6e4',
    fontsize: 44
}
```

Luego agregar el botón en el HTML:
```html
<button class="lang-btn" onclick="setLang('mi_preset', this)">Mi Preset</button>
```

## Tamaños recomendados por plataforma
| Plataforma | Alto recomendado |
|------------|-----------------|
| Google Forms portada | 400px |
| YouTube banner | 400px |
| Facebook portada | 314px |
| LinkedIn portada | 300px |
| WhatsApp imagen | 400px |

## Exportar
Clic en "Descargar PNG" — genera el archivo con nombre automático basado en el subtítulo.

## Copiar configuración
Clic en "Copiar configuración" — copia el JSON del preset actual al portapapeles para guardarlo o compartirlo con GEO.

---
Componente creado: Abril 2026
Autor: Mario Guillaume
Parte del ecosistema GEO
