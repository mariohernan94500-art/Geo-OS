export function routeTask(task) {
  if (task.type === "analysis") {
    return ["deepseek", "openrouter"];
  }

  if (task.type === "code") {
    return ["groq", "openrouter"];
  }

  return ["openrouter", "deepseek", "groq"];
}
