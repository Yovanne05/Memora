import { Navigate, createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/app/")({
  component: () => <Navigate to="/app/dashboard" />,
});