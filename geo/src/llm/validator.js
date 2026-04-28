export function validate(response) {
  if (!response) return false;
  if (response.length < 100) return false;
  if (response.toLowerCase().includes("error")) return false;

  return true;
}
