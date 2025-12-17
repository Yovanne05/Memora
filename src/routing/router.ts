import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { DefaultNotFound } from "./default-not-found";

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: DefaultNotFound,
});
