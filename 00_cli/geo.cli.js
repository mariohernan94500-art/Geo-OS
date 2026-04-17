const fs = require("fs");
const path = require("path");

function loadContract() {
    try {
        const contractPath = path.resolve(process.cwd(), "00_nucleus", "geo.contract.json");
        const raw = fs.readFileSync(contractPath, "utf8").trim();
        return JSON.parse(raw);
    } catch (err) {
        console.log("[ERROR] No se pudo cargar el contrato:", err.message);
        return null;
    }
}

const cmd = process.argv[2];

function status() {
    const contract = loadContract();
    if (!contract) {
        console.log("[ERROR] Contrato no encontrado o invalido");
        return;
    }
    console.log("╔══════════════════════════════╗");
    console.log("║     GEO CLI v2 — STATUS      ║");
    console.log("╠══════════════════════════════╣");
    console.log("  Sistema  :", contract.system);
    console.log("  Version  :", contract.version);
    console.log("  Core     :", contract.runtime.entry);
    console.log("  Agentes  :", contract.runtime.agents);
    console.log("  Data     :", contract.runtime.data);
    console.log("  Frontend :", contract.runtime.frontend);
    console.log("╚══════════════════════════════╝");
}

function help() {
    console.log("GEO CLI v2 — Comandos disponibles:");
    console.log("  geo status   → estado del sistema");
    console.log("  geo help     → esta ayuda");
}

if (cmd === "status")     { status(); }
else if (cmd === "help")  { help(); }
else { console.log("[GEO] Comando desconocido. Usa: geo help"); }
