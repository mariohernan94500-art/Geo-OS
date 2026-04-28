import { runGeo } from "./core/geo.js";

const task = {
  type: "code",
  prompt: "Crea una landing page moderna en HTML con estilo SaaS"
};

runGeo(task)
  .then(res => {
    console.log("✅ GEO completado:", res);
  })
  .catch(err => {
    console.error("❌ Error GEO:", err);
  });
