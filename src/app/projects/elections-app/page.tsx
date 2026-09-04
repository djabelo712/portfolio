import { projects } from "@/lib/portfolio-data";
import { ProjectDetail } from "@/components/portfolio/project-detail";
import { notFound } from "next/navigation";

export async function generateMetadata() {
  const project = projects.find((p) => p.id === "elections-app");
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.title} — Djabon Ounimborbitibou`,
    description: project.tagline,
  };
}

export default function Page() {
  const project = projects.find((p) => p.id === "elections-app");
  if (!project) notFound();
  return <ProjectDetail project={project} />;
}
