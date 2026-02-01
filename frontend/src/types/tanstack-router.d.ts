import { router } from "../routing/router";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
