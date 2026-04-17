# PL - Plan de Despliegue Maestro (Geo OS)

Este plan de lanzamiento (Phase 6+) asegura que el ecosistema pase de desarrollo local a un entorno de **Producción VPS (Railway o Servidor Dedicado)** con alta disponibilidad.

## 📋 Checklist de Lanzamiento
- [ ] **Firewall**: Abrir puertos 3000 (API) y 8080 (Dashboard Voren).
- [ ] **Memoria**: Ejecutar el primer sync manual `node scripts/vps-sync.js`.
- [ ] **Seguridad**: Asegurar que `JWT_SECRET` en `.env` no sea el de defecto.
- [ ] **Bot**: Registrar el nuevo bot de Telegram en el VPS con el token consolidado.

## 🚀 Despliegue unificado con Docker
Para lanzar todo el ecosistema en un solo paso, usa el archivo `Dockerfile` en la carpeta `docker/`.

### Comandos de Despliegue (Local o VPS)
```bash
# 1. Construir la imagen maestra
docker build -t geo-os-master -f docker/Dockerfile .

# 2. Levantar el ecosistema (Bot + API + Voren)
docker run -d -p 3000:3000 -p 8080:8080 --env-file .env geo-os-master
```

## 📈 Monitoreo 24/7 (PM2)
El sistema utiliza PM2 para el autoreinicio:
- Si el cerebro de Geo falla por falta de memoria, PM2 lo reiniciará en < 1 seg.
- Los logs se guardarán centralizados para depuración remota.

---
**Mario, este plan garantiza que el sistema sea inmortal y siempre accesible desde tu celular.**
