const { exec } = require('child_process');

console.log("🚨 INICIANDO PROTOCOLO DE LIMPIEZA...");

// Matar procesos colgados de Python (uvicorn) y Electron
const commands = [
    'taskkill /f /im python.exe',
    'taskkill /f /im electron.exe',
    'taskkill /f /im uvicorn.exe'
];

commands.forEach(cmd => {
    exec(cmd, (err) => {
        if(err) console.log(`Nota: Proceso no encontrado o ya cerrado.`);
        else console.log(`✓ Comando ejecutado: ${cmd}`);
    });
});

setTimeout(() => {
    console.log("-----------------------------------------");
    console.log("✅ SISTEMA LIMPIO. Ya puedes intentar 'npm run electron'");
    console.log("-----------------------------------------");
}, 2000);
