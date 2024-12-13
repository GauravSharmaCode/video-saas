import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server"; // Import NextResponse for redirects

/**
 * @author Gaurav Sharma
 * @github https://github.com/GauravSharmaCode
 * @description Middleware for handling authentication and route protection in a Clerk + Next.js app.
 */
export default clerkMiddleware((auth, req) => {
  // Create route matchers for public pages and public API endpoints.
  const isPublicRoute = createRouteMatcher([
    "/sign-in",
    "/sign-up",
    "/",
    "/home",
  ]);
  const isPublicApiRoute = createRouteMatcher(["/api/video"]);

  /**
   * Safely handle cases where `req.url` might be undefined.
   * Use the root URL `/` as a fallback to avoid runtime errors.
   */
  const currentUrl = req.url ? new URL(req.url) : new URL("/");

  /**
   * Helper flags to identify the type of route based on the request URL.
   */
  const isHomePage = currentUrl.pathname === "/home"; // Check if the route is the homepage.
  const isApiRequest = currentUrl.pathname.startsWith("/api"); // Check if the route is an API endpoint.

  /**
   * Correctly access `userId` from the `auth` object.
   * TypeScript issues can be resolved with a type assertion (`as any`) temporarily.
   */
  const userId = (auth as any).userId;

  /**
   * Handle logic for logged-in users:
   * - Redirect logged-in users to `/home` if they access public routes (except `/home`).
   */
  if (userId && isPublicRoute(req) && !isHomePage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  /**
   * Handle logic for unauthenticated users:
   * - Redirect unauthenticated users to `/signin` if they try to access private pages or API routes.
   */
  if (!userId) {
    if (!isPublicRoute(req) && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Ensure API requests by unauthenticated users are also redirected.
    if (isApiRequest && !isPublicApiRoute(req)) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // If no redirect is needed, the middleware proceeds to the next handler.
  return NextResponse.next();
});

/**
 * Configuration for the middleware.
 * Defines which routes should invoke the middleware using Next.js route matching patterns.
 */
export const config = {
  matcher: [
    /**
     * Match all routes except:
     * - Internal Next.js routes (`_next`).
     * - Static files like `.html`, `.css`, `.js`, images, fonts, and documents.
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    /**
     * Always match API routes (including `/trpc`).
     */
    "/(api|trpc)(.*)",
  ],
};
