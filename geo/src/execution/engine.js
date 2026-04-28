import { exec } from "child_process";

export async function executeApp(app) {
  console.log("🚀 Ejecutando app:", app.name);

  exec(
    `npx serve ${app.path} -l ${app.port}`,
    (err, stdout, stderr) => {
      if (err) {
        console.error("❌ Error ejecutando app:", err);
        return;
      }

      console.log(`🌍 App corriendo en puerto ${app.port}`);
    }
  );
}
