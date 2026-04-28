import { routeTask } from "../llm/router.js";
import { callLLM } from "../llm/client.js";
import { validate } from "../llm/validator.js";
import { createApp } from "../agents/zai.js";
import { executeApp } from "../execution/engine.js";
import { logEvent } from "../db/db.js";

export async function runGeo(task) {
  console.log("🧠 GEO ejecutando tarea:", task);

  const models = routeTask(task);

  let response = null;

  for (let model of models) {
    console.log("➡️ Probando modelo:", model);

    const res = await callLLM(model, task);

    if (validate(res)) {
      response = res;
      break;
    }
  }

  if (!response) {
    throw new Error("❌ Todos los modelos fallaron");
  }

  console.log("✅ Respuesta válida obtenida");

  // Z.ai construye
  const app = await createApp(response);

  // Ejecutar
  await executeApp(app);

  await logEvent("APP_CREATED", app.name);

  return app;
}
