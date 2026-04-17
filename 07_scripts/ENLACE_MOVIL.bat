@echo off
color 0B
echo ========================================================
echo 🛰️ GEO CORE: ACTIVANDO ENLACE MÓVIL TÁCTICO
echo ========================================================
echo Instalando dependencias de tunelaje seguro...
call npm install -g localtunnel
echo.
echo 📡 Conectando con los satelites...
echo.
echo --------------------------------------------------------
echo INSTRUCCIONES:
echo 1. Copia el link que va a aparecer abajo (termina en .loca.lt).
echo 2. Pegalo en Google Chrome de tu telefono.
echo 3. AL FINAL DEL LINK, añade esto: /pantalla-movil
echo 4. Ejemplo: https://tunel-secreto.loca.lt/pantalla-movil
echo --------------------------------------------------------
echo.
lt --port 8000
pause
