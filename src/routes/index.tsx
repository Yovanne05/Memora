import { createFileRoute, redirect } from "@tanstack/react-router";
import { getAccessToken } from "@/features/auth/lib/token-storage";

export const Route = createFileRoute("/")({
  loader: () => {
    const token = getAccessToken();
    throw redirect({
      to: token ? "/app/dashboard" : "/auth/login",
    });
  },
});
