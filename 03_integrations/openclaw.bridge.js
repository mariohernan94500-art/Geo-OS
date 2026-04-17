const fs = require("fs");
const path = require("path");

class OpenClawBridge {
  constructor() {
    this.contractPath = path.join(__dirname, "../00_nucleus/geo.contract.json");
    this.contract = null;
  }

  loadContract() {
    try {
      const raw = fs.readFileSync(this.contractPath, "utf8").toString().trim();
      this.contract = JSON.parse(raw);
      console.log("[OpenClaw] Contrato cargado");
      return this.contract;
    } catch (err) {
      console.error("[OpenClaw] Error al cargar contrato:", err.message);
      return null;
    }
  }

  getRuntime() {
    if (!this.contract) this.loadContract();
    return this.contract?.runtime || null;
  }

  getRules() {
    if (!this.contract) this.loadContract();
    return this.contract?.rules || null;
  }

  isNodeModulesEphemeral() {
    return this.getRules()?.node_modules === "ephemeral";
  }

  resetAllowed() {
    return this.getRules()?.reset_allowed === true;
  }

  printStatus() {
    const r = this.getRuntime();
    const rules = this.getRules();
    console.log("===== OPENCLAW STATUS =====");
    console.log("  Core     :", r?.entry);
    console.log("  Agentes  :", r?.agents);
    console.log("  Data     :", r?.data);
    console.log("  Frontend :", r?.frontend);
    console.log("  Reset    :", rules?.reset_allowed);
    console.log("===========================");
  }
}

module.exports = new OpenClawBridge();
