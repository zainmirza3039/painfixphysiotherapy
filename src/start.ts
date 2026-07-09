import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
// NOTE: attachSupabaseAuth is intentionally NOT registered. The site has no
// `createServerFn` calls that use `requireSupabaseAuth`, so attaching a bearer
// token to server RPCs is unnecessary — and importing it here would pull the
// full Supabase client into the initial bundle on every page load. The forms
// use the browser Supabase client via a lazy `await import(...)` instead.
// Re-add it to `functionMiddleware` below if you introduce auth'd server functions.

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware],
}));
