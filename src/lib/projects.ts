export type ProjectDef = { id: string; name: string; color: string };

export const PROJECTS: ProjectDef[] = [
  { id: "ai-model", name: "AI-модель", color: "#378ADD" },
  { id: "cargo", name: "Карго", color: "#1D9E75" },
  { id: "courses", name: "Курсы", color: "#7F77DD" },
  { id: "tyumgu", name: "ТюмГУ", color: "#EF9F27" },
];

export function projectColor(id: string) {
  return PROJECTS.find((p) => p.id === id)?.color || "#888";
}
export function projectName(id: string) {
  return PROJECTS.find((p) => p.id === id)?.name || id;
}
