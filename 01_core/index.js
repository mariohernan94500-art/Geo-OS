const OpenClaw = require("../03_integrations/openclaw.bridge");

class GeoCore {
  constructor() {
    this.bridge = OpenClaw;
  }

  start() {
    console.log("===== GEO CORE STARTING =====");
    const contract = this.bridge.loadContract();
    if (!contract) {
      console.error("[GeoCore] No contract loaded");
      return;
    }
    this.bridge.printStatus();
    console.log("[GeoCore] Sistema inicializado correctamente");
    console.log("=============================");
  }
}

if (require.main === module) {
  const core = new GeoCore();
  core.start();
}

module.exports = GeoCore;
