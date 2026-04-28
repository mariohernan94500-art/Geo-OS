import fs from "fs";

export async function createApp(code) {
  const name = "app_" + Date.now();
  const dir = `apps/${name}`;

  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(`${dir}/index.html`, code);

  return {
    name,
    path: dir,
    port: 3000 + Math.floor(Math.random() * 1000)
  };
}
