import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VSS Student Management Portal" },
      {
        name: "description",
        content:
          "Varkari Shikshan Sanstha student management portal for admissions, attendance, fees and student records.",
      },
      { property: "og:title", content: "VSS Student Management Portal" },
      {
        property: "og:description",
        content:
          "Manage students, attendance, fees and reports for Varkari Shikshan Sanstha.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  useEffect(() => {
    window.location.replace("/app/index.html");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Loading portal…</p>
    </div>
  );
}
