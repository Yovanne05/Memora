import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType
} from "react-router-dom";

export function initSentry() {
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    if (isProduction) {
      console.warn("Sentry DSN not configured. Error monitoring is disabled.");
    }
    return;
  }

  Sentry.init({
    dsn: sentryDsn,

    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Capture 10% of all sessions
    replaysSessionSampleRate: 0.1,
    // Capture 100% of sessions with errors
    replaysOnErrorSampleRate: 1.0,

    environment: isProduction ? "prod" : "dev",

    release: import.meta.env.VITE_SENTRY_RELEASE,

    beforeSend(event, hint) {
      if (event.exception) {
        const error = hint.originalException;

        if (error instanceof Error && error.message.includes("NetworkError")) {
          return null;
        }
      }

      return event;
    },

    ignoreErrors: [
      "top.GLOBALS",
      "chrome-extension://",
      "moz-extension://",
      "NetworkError",
      "Failed to fetch",
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],

    denyUrls: [
      /extensions\//i,
      /^chrome:\/\//i,
      /^moz-extension:\/\//i,
    ],
  });
}

export function createTanStackRouterInstrumentation() {
  return Sentry.reactRouterV6BrowserTracingIntegration({
    useEffect,
    useLocation,
    useNavigationType,
    createRoutesFromChildren,
    matchRoutes,
  });
}
